import { apiRequest } from "./queryClient";
import type { 
  User, 
  Product, 
  Category, 
  CartItem, 
  Order,
  ProductWithCategory,
  CartItemWithProduct,
  OrderWithItems 
} from "@shared/schema";

export const api = {
  // Auth
  register: async (userData: { username: string; email: string; password: string }) => {
    const res = await apiRequest("POST", "/api/auth/register", userData);
    return await res.json();
  },

  login: async (credentials: { email: string; password: string }) => {
    const res = await apiRequest("POST", "/api/auth/login", credentials);
    return await res.json();
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await apiRequest("GET", "/api/categories");
    return await res.json();
  },

  // Products
  getProducts: async (filters?: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ProductWithCategory[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    const res = await apiRequest("GET", `/api/products?${params.toString()}`);
    return await res.json();
  },

  getProduct: async (id: number): Promise<ProductWithCategory> => {
    const res = await apiRequest("GET", `/api/products/${id}`);
    return await res.json();
  },

  createProduct: async (productData: any): Promise<Product> => {
    const res = await apiRequest("POST", "/api/products", productData);
    return await res.json();
  },

  updateProduct: async (id: number, updates: any): Promise<Product> => {
    const res = await apiRequest("PUT", `/api/products/${id}`, updates);
    return await res.json();
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/products/${id}`);
  },

  // Cart
  getCartItems: async (userId: number): Promise<CartItemWithProduct[]> => {
    const res = await apiRequest("GET", `/api/cart/${userId}`);
    return await res.json();
  },

  addToCart: async (cartItem: { userId: number; productId: number; quantity: number }): Promise<CartItem> => {
    const res = await apiRequest("POST", "/api/cart", cartItem);
    return await res.json();
  },

  updateCartItem: async (id: number, quantity: number): Promise<CartItem> => {
    const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    return await res.json();
  },

  removeFromCart: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/cart/${id}`);
  },

  clearCart: async (userId: number): Promise<void> => {
    await apiRequest("DELETE", `/api/cart/clear/${userId}`);
  },

  // Orders
  getOrders: async (userId?: number): Promise<OrderWithItems[]> => {
    const params = userId ? `?userId=${userId}` : "";
    const res = await apiRequest("GET", `/api/orders${params}`);
    return await res.json();
  },

  getOrder: async (id: number): Promise<OrderWithItems> => {
    const res = await apiRequest("GET", `/api/orders/${id}`);
    return await res.json();
  },

  createOrder: async (orderData: {
    order: { userId: number; total: string; shippingAddress: string };
    items: { productId: number; quantity: number; price: string }[];
  }): Promise<Order> => {
    const res = await apiRequest("POST", "/api/orders", orderData);
    return await res.json();
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const res = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    return await res.json();
  },
};
