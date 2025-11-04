// Reference: Replit Auth and Database blueprints
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isEmployee, isAdmin } from "./replitAuth";
import { insertProductSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, isEmployee, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: error.message || "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, isEmployee, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const validated = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, validated);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: error.message || "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, isEmployee, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      await storage.deleteProduct(productId);
      res.json({ message: "Produto desativado com sucesso" });
    } catch (error) {
      console.error("Error deactivating product:", error);
      res.status(500).json({ message: "Falha ao desativar produto" });
    }
  });

  // Review routes
  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/products/:id/can-review', isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const canReview = await storage.canUserReviewProduct(userId, productId);
      res.json({ canReview });
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      res.status(500).json({ message: "Failed to check review eligibility" });
    }
  });

  app.post('/api/products/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user can review this product
      const canReview = await storage.canUserReviewProduct(userId, productId);
      if (!canReview) {
        return res.status(403).json({ 
          message: "You must purchase this product before reviewing it, and can only review once" 
        });
      }
      
      const validated = insertReviewSchema.parse({
        ...req.body,
        userId,
        productId,
      });
      
      const review = await storage.createReview(validated);
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: error.message || "Failed to create review" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { items, totalAmount } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items are required" });
      }
      
      const order = await storage.createOrder(
        {
          userId,
          totalAmount,
          status: "pending",
        },
        items
      );
      
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: error.message || "Failed to create order" });
    }
  });

  app.post('/api/orders/:id/repeat', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const order = await storage.getOrderWithItems(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: Not your order" });
      }
      
      res.json({ items: order.items });
    } catch (error) {
      console.error("Error repeating order:", error);
      res.status(500).json({ message: "Failed to repeat order" });
    }
  });

  app.patch('/api/orders/:id/status', isAuthenticated, isEmployee, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(orderId, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Send SMS notification when order is ready for delivery
      if (status === 'ready_for_delivery') {
        const orderWithDetails = await storage.getOrderWithItems(orderId);
        const user = await storage.getUser(order.userId);
        
        if (user?.phoneNumber && orderWithDetails) {
          const { sendOrderReadySMS } = await import('./smsService');
          const customerName = user.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : undefined;
          
          await sendOrderReadySMS({
            phoneNumber: user.phoneNumber,
            customerName,
            orderId: orderWithDetails.id,
            totalAmount: orderWithDetails.totalAmount,
          });
        }
      }
      
      res.json(order);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      res.status(400).json({ message: error.message || "Failed to update order status" });
    }
  });

  // Employee dashboard routes
  app.get('/api/dashboard/orders', isAuthenticated, isEmployee, async (req, res) => {
    try {
      const orders = await storage.getAllOrdersForDashboard();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching dashboard orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      
      if (!role || !['client', 'employee', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(userId, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: error.message || "Failed to update user role" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Preassigned roles routes
  app.get('/api/admin/preassigned-roles', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const preassignedRoles = await storage.getAllPreassignedRoles();
      res.json(preassignedRoles);
    } catch (error) {
      console.error("Error fetching preassigned roles:", error);
      res.status(500).json({ message: "Falha ao buscar perfis pré-atribuídos" });
    }
  });

  app.post('/api/admin/preassigned-roles', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { email, firstName, lastName, phoneNumber, role } = req.body;
      const createdBy = req.user.claims.sub;
      
      if (!email || !role) {
        return res.status(400).json({ message: "Email e perfil são obrigatórios" });
      }
      
      if (!['client', 'employee', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Perfil inválido" });
      }
      
      const preassignedRole = await storage.createPreassignedRole({ 
        email, 
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phoneNumber: phoneNumber || undefined,
        role, 
        createdBy 
      });
      
      // Send welcome SMS if phone number provided
      if (phoneNumber) {
        const { sendWelcomeSMS } = await import('./smsService');
        await sendWelcomeSMS({
          phoneNumber,
          firstName,
          email,
          role,
        });
      }
      
      res.status(201).json(preassignedRole);
    } catch (error: any) {
      console.error("Error creating preassigned role:", error);
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ message: "Já existe uma atribuição de perfil para este email" });
      }
      res.status(400).json({ message: error.message || "Falha ao criar perfil pré-atribuído" });
    }
  });

  app.delete('/api/admin/preassigned-roles/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      await storage.deletePreassignedRole(roleId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting preassigned role:", error);
      res.status(500).json({ message: "Falha ao deletar perfil pré-atribuído" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
