# Cupcake Store E-Commerce Application

## Overview

This is a full-stack e-commerce web application for selling cupcakes online. The application features a modern React-based frontend with a Node.js/Express backend, PostgreSQL database via Neon, and role-based access control supporting three user types: Clients, Employees, and Administrators.

The system provides core e-commerce functionality including product browsing, shopping cart management, order processing, product reviews, and administrative dashboards for product and order management.

## Recent Changes

**November 10, 2025:**
- ✅ **User Address Management**: Complete implementation of address field for user profiles
  - Added `address` field (text type) to both users and preassigned_roles tables
  - Updated all Zod schemas (insertUserSchema, updateUserSchema, insertPreassignedRoleSchema) to include optional address
  - Enhanced storage layer to handle address in upsertUser and updateUser operations
  - Authentication flow applies preassigned address on first login (if provided)
  - Admin can now pre-register users with address (automatically applied on first login)
  - Admin can edit user addresses via user management panel
- ✅ **User Profile Page**: New self-service profile management page for all users
  - Created `/profile` route accessible to all authenticated users via user menu
  - Users can edit their own firstName, lastName, phoneNumber, and address
  - Secure implementation: users cannot change their email or role
  - Created `PATCH /api/user/profile` endpoint with proper authentication
  - Form correctly hydrates with existing user data using useEffect pattern
  - Real-time validation and success feedback with toast notifications
  - E2E tested: preassignment → first login → profile update flow verified
  - Bug fix: Corrected useState to useEffect for proper async data hydration

**November 4, 2025:**
- ✅ **Product Reviews from Orders Page**: Clients can now easily review purchased products
  - Created reusable `ReviewModal` component with star rating (1-5) and optional comment
  - Added "Avaliar" button for each reviewable product on Orders page
  - Query checks review eligibility for all products in user's orders
  - Modal prevents closing during submission to preserve user data
  - Cache invalidation ensures buttons disappear after review submission
  - Intuitive UX: buttons only appear for delivered products that haven't been reviewed
- ✅ **User Editing for Admins**: Admins can now edit existing users (name, email, phone, role)
  - Created `PATCH /api/admin/users/:id` endpoint with secure validation
  - Added `updateUserSchema` in shared/schema for input validation
  - Implemented `storage.updateUser()` with email uniqueness check
  - Admin UI includes edit button and modal for each user
  - SMS notification sent when admin updates user (if phone number exists)
  - Secure implementation: schema validation prevents arbitrary field updates
  - Error handling: duplicate email returns 409, validation errors return 400
- ✅ **SMS Notification System (Simulation)**: Implemented SMS notification infrastructure
  - Added `phoneNumber` field to users and preassigned_roles tables
  - Created `smsService.ts` for SMS simulation (console logging)
  - SMS sent when admin pre-registers user with phone number (welcome message)
  - SMS sent when order status changes to "ready_for_delivery" (order ready notification)
  - SMS sent when admin edits user information (update notification)
  - Ready for integration with real SMS providers (Twilio, Infobip, SMSDev, etc.)
  - Admin UI updated with optional phone field in pre-registration form
  - Phone number automatically applied on first login if provided in pre-registration
  
**November 2, 2025:**
- ✅ **Enhanced Pre-registration System**: Admins can now specify optional firstName and lastName when pre-registering users. Names are automatically applied on first login if Replit profile lacks them.
- ✅ **Bug Fix: Repeat Order**: Fixed TypeError where mutation wasn't parsing response as JSON. Added `.json()` call.
- ✅ **Bug Fix: Order Status Updates**: Fixed cache invalidation to update both Dashboard (`/api/dashboard/orders`) and Client Orders (`/api/orders`) simultaneously.
- ✅ **Authentication Flow**: Corrected upsertUser operation order to insert user before applying preassigned role, ensuring first-login promotion works correctly.
- ✅ **LGPD Compliance**: Fixed lgpdAccepted timestamp preservation across logins (no longer resets on subsequent logins).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: 
  - Zustand for client-side state (shopping cart)
  - TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system based on e-commerce best practices

**Design System:**
- Follows reference-based design approach inspired by Shopify and Etsy
- Typography: Playfair Display/Cormorant for headings (premium bakery feel), Inter/DM Sans for UI
- Responsive grid layouts with Tailwind breakpoints
- Consistent spacing primitives (2, 4, 6, 8, 12, 16, 20, 24)

**Key Frontend Patterns:**
- Component-based architecture with reusable UI components
- Custom hooks for common functionality (useAuth, useCart)
- Form validation using React Hook Form with Zod schemas
- Optimistic UI updates with React Query mutations

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth via OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL storage (connect-pg-simple)

**API Design:**
- RESTful API endpoints under `/api` namespace
- Middleware-based authentication and authorization
- Role-based access control with three roles: client, employee, admin
- Structured error handling with appropriate HTTP status codes

**Authentication Flow:**
- Uses Replit's OIDC authentication provider
- Session-based authentication with secure, httpOnly cookies
- Passport.js for OIDC strategy implementation
- User data synchronized with local database on authentication

**Authorization Layers:**
- `isAuthenticated`: Requires any logged-in user
- `isEmployee`: Requires employee or admin role (product/order management)
- `isAdmin`: Requires admin role (user management)

**User Roles and Permissions:**
- **Client (default)**: New users are automatically created with 'client' role on first login
  - Can browse products, manage cart, place orders, write reviews
  - Can edit own profile (name, phone, address) via `/profile`
  - Access to: `/`, `/products`, `/cart`, `/checkout`, `/orders`, `/profile`
- **Employee**: Assigned by admin, can manage products and orders
  - All client permissions plus product/order management
  - Access to: `/dashboard` (product management, order queue)
- **Admin**: Full system access including user management
  - All employee permissions plus user role management
  - Access to: `/admin` (user management, role assignment)
  - Can promote users to employee/admin or demote to client
  - Can pre-register users with complete information (name, phone, address, role)

**Initial Admin Setup:**
- First user must be promoted to admin via SQL: `UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';`
- After that, admins can manage all user roles through the `/admin` panel
- **Pre-registration system**: Admins can pre-assign complete user information before first login
  - Supports optional firstName, lastName, phoneNumber, address in preassignment
  - If Replit profile lacks names, preassigned names are automatically applied on first login
  - All preassigned fields (including address) are applied on first login
  - New users automatically receive pre-assigned role during authentication
  - Pre-assigned roles are marked as consumed after first login
  - Supports employee and admin role pre-assignment for controlled access
  - Password is always managed via Replit Auth (OIDC), never stored locally

**User Profile Management:**
- All authenticated users can access `/profile` to edit their information
- Users can update: firstName, lastName, phoneNumber, address
- Security: users cannot change email or role via profile (admin-only actions)
- Profile form correctly hydrates with existing data using React hooks
- Changes are saved via `PATCH /api/user/profile` with proper validation

**Password Recovery:**
- Password recovery is managed through Replit Auth (OIDC provider)
- Users can click "Esqueci minha senha" in the header to see instructions
- Recovery process uses Replit's "Forgot password?" link on login screen

### Database Schema

**Core Tables:**
1. **users**: User accounts with role-based permissions (client, employee, admin), LGPD acceptance tracking, phone number for SMS notifications, address for deliveries
2. **products**: Cupcake products with name, description, price, image, stock quantity, **isActive** (soft delete flag)
3. **orders**: Customer orders with status tracking (pending, in_preparation, ready_for_delivery, delivered)
4. **orderItems**: Individual line items within orders with price snapshot at purchase
5. **reviews**: Product reviews with ratings (1-5) and comments, linked to verified purchases
6. **sessions**: Session storage for authentication (required by Replit Auth)
7. **preassigned_roles**: Pre-assigned roles for users before first login (email, firstName, lastName, phoneNumber, address, role, createdBy, consumed)

**Key Relationships:**
- Users → Orders (one-to-many)
- Orders → OrderItems (one-to-many)
- Products → OrderItems (one-to-many)
- Products → Reviews (one-to-many)
- Users → Reviews (one-to-many)
- Admin Users → Preassigned Roles (one-to-many via createdBy)

**Data Integrity:**
- Price captured at purchase time in orderItems (historical accuracy)
- Review validation: users can only review products they've purchased
- Soft validation on stock quantities
- **Soft delete on products**: Products are deactivated (isActive=false) instead of deleted to preserve order history
- **Pre-assigned roles**: Admins can assign roles by email before user's first login, automatically applied during authentication

### External Dependencies

**Database:**
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL database
- Connection via `@neondatabase/serverless` with WebSocket support
- Drizzle ORM for type-safe database queries

**Authentication:**
- **Replit Auth**: OIDC-based authentication provider
- Handles user identity, profile management, and session lifecycle
- Integrated via `openid-client` and Passport.js

**UI Component Library:**
- **Shadcn/ui**: Component library built on Radix UI primitives
- Provides accessible, customizable components (dialogs, dropdowns, forms, etc.)
- Styled with Tailwind CSS using CSS variables for theming

**Additional Services:**
- **Google Fonts**: Playfair Display and Inter font families
- **Asset Management**: Static assets stored in `attached_assets` directory

**Development Tools:**
- **Replit Plugins**: Runtime error overlay, cartographer (development mode), dev banner
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast production bundling for backend

**Key Integrations:**
- Form validation: React Hook Form + Zod + Drizzle-Zod schema integration
- File uploads: Not currently implemented (placeholder for future image uploads)
- Payment processing: Not currently implemented (placeholder for future integration)