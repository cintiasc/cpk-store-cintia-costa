// Reference: Replit Auth blueprint
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  const userId = claims["sub"];
  const userEmail = claims["email"];
  
  // Check if user already exists
  const existingUser = await storage.getUser(userId);
  
  let firstName = claims["first_name"];
  let lastName = claims["last_name"];
  let phoneNumber = undefined;
  let preassignedRole = null;
  
  // If it's a new user (first login), check for preassigned role and names
  if (!existingUser && userEmail) {
    preassignedRole = await storage.getPreassignedRoleByEmail(userEmail);
    if (preassignedRole) {
      // Use preassigned names if provided and Replit profile is empty
      if (preassignedRole.firstName && !firstName) {
        firstName = preassignedRole.firstName;
      }
      if (preassignedRole.lastName && !lastName) {
        lastName = preassignedRole.lastName;
      }
      // Use preassigned phone number if provided
      if (preassignedRole.phoneNumber) {
        phoneNumber = preassignedRole.phoneNumber;
      }
    }
  }
  
  // Upsert user with names and phone (from Replit or preassigned)
  await storage.upsertUser({
    id: userId,
    email: userEmail,
    firstName,
    lastName,
    phoneNumber: existingUser?.phoneNumber || phoneNumber,
    profileImageUrl: claims["profile_image_url"],
    lgpdAccepted: existingUser ? existingUser.lgpdAccepted : new Date(), // Keep original LGPD date or set on first login
  });
  
  // AFTER creating the user, apply preassigned role if it exists
  if (preassignedRole) {
    await storage.updateUserRole(userId, preassignedRole.role);
    await storage.markPreassignedRoleAsConsumed(userEmail);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// Role-based access control middleware
export const isEmployee: RequestHandler = async (req, res, next) => {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(userId);
  if (!user || (user.role !== "employee" && user.role !== "admin")) {
    return res.status(403).json({ message: "Forbidden: Employee access required" });
  }

  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
};
