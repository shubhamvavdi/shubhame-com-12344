import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  payments,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Payment,
  type InsertPayment,
  type ProductWithCategory,
  type CartItemWithProduct,
  type OrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(filters?: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ProductWithCategory[]>;
  getProduct(id: number): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Cart
  getCartItems(userId: number): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;

  // Orders
  getOrders(userId?: number): Promise<OrderWithItems[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByOrderId(orderId: number): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private async seedData() {
    try {
      // Check if categories already exist
      const existingCategories = await db.select().from(categories).limit(1);
      if (existingCategories.length > 0) return; // Data already seeded

      // Seed categories
      await db.insert(categories).values([
        { name: "Electronics", slug: "electronics" },
        { name: "Clothing", slug: "clothing" },
        { name: "Books", slug: "books" },
        { name: "Home & Garden", slug: "home-garden" },
      ]);

      // Seed products
      await db.insert(products).values([
        {
          name: "Smartphone",
          description: "Latest smartphone with advanced features",
          price: "699.99",
          image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
          images: [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
            "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300"
          ],
          categoryId: 1,
          stock: 50,
          rating: "4.5",
          reviewCount: 128,
          featured: true,
          salePrice: "599.99",
        },
        {
          name: "Laptop",
          description: "High-performance laptop for work and gaming",
          price: "1299.99",
          image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300",
          images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300"],
          categoryId: 1,
          stock: 25,
          rating: "4.7",
          reviewCount: 89,
          featured: true,
        },
        {
          name: "T-Shirt",
          description: "Comfortable cotton t-shirt",
          price: "29.99",
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
          images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300"],
          categoryId: 2,
          stock: 100,
          rating: "4.2",
          reviewCount: 45,
          featured: false,
          salePrice: "24.99",
        },
        {
          name: "Programming Book",
          description: "Learn modern web development",
          price: "49.99",
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300",
          images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300"],
          categoryId: 3,
          stock: 200,
          rating: "4.8",
          reviewCount: 267,
          featured: true,
        },
      ]);

      // Create admin user
      await db.insert(users).values({
        username: "admin",
        email: "admin@example.com",
        password: "admin123", // In a real app, this would be hashed
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      });
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      phone: insertUser.phone || null,
      address: insertUser.address || null,
      isAdmin: insertUser.isAdmin || false,
    }).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async getProducts(filters?: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ProductWithCategory[]> {
    let query = db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      salePrice: products.salePrice,
      image: products.image,
      images: products.images,
      categoryId: products.categoryId,
      stock: products.stock,
      rating: products.rating,
      reviewCount: products.reviewCount,
      featured: products.featured,
      createdAt: products.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      }
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id));

    if (filters) {
      if (filters.categoryId) {
        query = query.where(eq(products.categoryId, filters.categoryId));
      }
      if (filters.minPrice) {
        query = query.where(gte(products.price, filters.minPrice.toString()));
      }
      if (filters.maxPrice) {
        query = query.where(lte(products.price, filters.maxPrice.toString()));
      }
      if (filters.search) {
        query = query.where(
          like(products.name, `%${filters.search}%`)
        );
      }
      if (filters.featured !== undefined) {
        query = query.where(eq(products.featured, filters.featured));
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.offset(filters.offset);
      }
    }

    const result = await query;
    return result.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      salePrice: row.salePrice,
      image: row.image,
      images: row.images,
      categoryId: row.categoryId,
      stock: row.stock,
      rating: row.rating,
      reviewCount: row.reviewCount,
      featured: row.featured,
      createdAt: row.createdAt,
      category: row.category
    }));
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    const [result] = await db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      salePrice: products.salePrice,
      image: products.image,
      images: products.images,
      categoryId: products.categoryId,
      stock: products.stock,
      rating: products.rating,
      reviewCount: products.reviewCount,
      featured: products.featured,
      createdAt: products.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      }
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id));

    if (!result) return undefined;

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      price: result.price,
      salePrice: result.salePrice,
      image: result.image,
      images: result.images,
      categoryId: result.categoryId,
      stock: result.stock,
      rating: result.rating,
      reviewCount: result.reviewCount,
      featured: result.featured,
      createdAt: result.createdAt,
      category: result.category
    };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values({
      ...insertProduct,
      salePrice: insertProduct.salePrice || null,
      images: insertProduct.images || null,
      categoryId: insertProduct.categoryId || null,
      stock: insertProduct.stock || null,
      rating: insertProduct.rating || null,
      reviewCount: insertProduct.reviewCount || null,
      featured: insertProduct.featured || null,
    }).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const [product] = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    const result = await db.select({
      id: cartItems.id,
      userId: cartItems.userId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      product: {
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        salePrice: products.salePrice,
        image: products.image,
        images: products.images,
        categoryId: products.categoryId,
        stock: products.stock,
        rating: products.rating,
        reviewCount: products.reviewCount,
        featured: products.featured,
        createdAt: products.createdAt,
      }
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

    return result.map(row => ({
      id: row.id,
      userId: row.userId,
      productId: row.productId,
      quantity: row.quantity,
      createdAt: row.createdAt,
      product: row.product
    }));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const [existingItem] = await db.select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, insertCartItem.userId || 0),
        eq(cartItems.productId, insertCartItem.productId || 0)
      ));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db.update(cartItems)
        .set({ quantity: existingItem.quantity + (insertCartItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    const [cartItem] = await db.insert(cartItems).values({
      userId: insertCartItem.userId || null,
      productId: insertCartItem.productId || null,
      quantity: insertCartItem.quantity || 1,
    }).returning();
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [item] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return item;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return true;
  }

  async getOrders(userId?: number): Promise<OrderWithItems[]> {
    let ordersQuery = db.select().from(orders);
    
    if (userId) {
      ordersQuery = ordersQuery.where(eq(orders.userId, userId));
    }

    const ordersList = await ordersQuery.orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      ordersList.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          product: {
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            salePrice: products.salePrice,
            image: products.image,
            images: products.images,
            categoryId: products.categoryId,
            stock: products.stock,
            rating: products.rating,
            reviewCount: products.reviewCount,
            featured: products.featured,
            createdAt: products.createdAt,
          }
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items: items.map(item => ({
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: item.product
          }))
        };
      })
    );

    return ordersWithItems;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      product: {
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        salePrice: products.salePrice,
        image: products.image,
        images: products.images,
        categoryId: products.categoryId,
        stock: products.stock,
        rating: products.rating,
        reviewCount: products.reviewCount,
        featured: products.featured,
        createdAt: products.createdAt,
      }
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id));

    return {
      ...order,
      items: items.map(item => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product
      }))
    };
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [order] = await db.insert(orders).values({
      userId: insertOrder.userId || null,
      total: insertOrder.total,
      status: insertOrder.status || "pending",
      shippingAddress: insertOrder.shippingAddress,
    }).returning();

    // Create order items
    await db.insert(orderItems).values(
      items.map(item => ({
        orderId: order.id,
        productId: item.productId || null,
        quantity: item.quantity,
        price: item.price,
      }))
    );

    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values({
      orderId: payment.orderId || null,
      stripePaymentId: payment.stripePaymentId || null,
      amount: payment.amount,
      currency: payment.currency || "usd",
      status: payment.status || "pending",
      paymentMethod: payment.paymentMethod || null,
    }).returning();
    return newPayment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentByOrderId(orderId: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId));
    return payment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [payment] = await db.update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }
}

export const storage = new DatabaseStorage();