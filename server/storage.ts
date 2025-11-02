// Reference: Replit Auth and Database blueprints
import {
  users,
  products,
  orders,
  orderItems,
  reviews,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Review,
  type InsertReview,
  type OrderWithItems,
  type ProductWithRating,
  type ReviewWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (REQUIRED for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  
  // Product operations
  getAllProducts(): Promise<ProductWithRating[]>;
  getProduct(id: number): Promise<ProductWithRating | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getUserOrders(userId: string): Promise<OrderWithItems[]>;
  getOrderWithItems(orderId: number): Promise<OrderWithItems | undefined>;
  getAllOrdersForDashboard(): Promise<OrderWithItems[]>;
  updateOrderStatus(orderId: number, status: string): Promise<Order | undefined>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getProductReviews(productId: number): Promise<ReviewWithUser[]>;
  canUserReviewProduct(userId: string, productId: number): Promise<boolean>;
  
  // Cart operations
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (REQUIRED for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Product operations
  async getAllProducts(): Promise<ProductWithRating[]> {
    const productsWithRatings = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}::numeric), 0)`,
        reviewCount: sql<number>`COUNT(${reviews.id})::int`,
      })
      .from(products)
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .groupBy(products.id)
      .orderBy(desc(products.createdAt));

    return productsWithRatings.map(p => ({
      ...p,
      averageRating: Number(p.averageRating),
      reviewCount: Number(p.reviewCount),
    }));
  }

  async getProduct(id: number): Promise<ProductWithRating | undefined> {
    const [result] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}::numeric), 0)`,
        reviewCount: sql<number>`COUNT(${reviews.id})::int`,
      })
      .from(products)
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .where(eq(products.id, id))
      .groupBy(products.id);

    if (!result) return undefined;

    return {
      ...result,
      averageRating: Number(result.averageRating),
      reviewCount: Number(result.reviewCount),
    };
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Order operations
  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Create order
    const [order] = await db.insert(orders).values(orderData).returning();

    // Create order items
    const itemsWithOrderId = items.map(item => ({
      ...item,
      orderId: order.id,
    }));

    await db.insert(orderItems).values(itemsWithOrderId);

    return order;
  }

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: [desc(orders.createdAt)],
    });

    return userOrders;
  }

  async getOrderWithItems(orderId: number): Promise<OrderWithItems | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        user: true,
      },
    });

    return order;
  }

  async getAllOrdersForDashboard(): Promise<OrderWithItems[]> {
    const allOrders = await db.query.orders.findMany({
      with: {
        items: {
          with: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: [desc(orders.createdAt)],
    });

    return allOrders;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }

  async getProductReviews(productId: number): Promise<ReviewWithUser[]> {
    const productReviews = await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      with: {
        user: true,
      },
      orderBy: [desc(reviews.createdAt)],
    });

    return productReviews;
  }

  async canUserReviewProduct(userId: string, productId: number): Promise<boolean> {
    // Check if user has purchased this product and hasn't reviewed it yet
    const purchasedOrders = await db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(orders.userId, userId),
        eq(orderItems.productId, productId)
      ));

    if (purchasedOrders.length === 0) {
      return false;
    }

    // Check if user already reviewed this product
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(
        eq(reviews.userId, userId),
        eq(reviews.productId, productId)
      ));

    return existingReview.length === 0;
  }

  // Cart operations
  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, orderId),
      with: {
        product: true,
      },
    });

    return items;
  }
}

export const storage = new DatabaseStorage();
