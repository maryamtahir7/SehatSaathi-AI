import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../lib/appwrite';

/* --------------------- TYPES --------------------- */
export interface OrderPayload {
  userId: string;
  items: string; // JSON Stringified
  total: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
  paymentMethod?: string;
  status: string;
}

export const dbService = {
  /* --------------------- PRODUCTS --------------------- */
  async addProduct(product: any) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, ID.unique(), product);
  },

  async getProducts() {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS);
  },

  async getProductById(productId: string) {
    return databases.getDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, productId);
  },

  async updateProduct(productId: string, updates: any) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, productId, updates);
  },

  async deleteProduct(productId: string) {
    return databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, productId);
  },

  async checkDuplicateProduct(productName: string) {
    try {
      const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS);
      const normalizedName = productName.toLowerCase().trim();
      return result.documents.some((p: any) => p.name.toLowerCase().trim() === normalizedName);
    } catch (error) {
      return false;
    }
  },

  async addProductsBulk(products: any[]) {
    const results: any = { success: [], failed: [], duplicates: [] };
    const existing = await this.getProducts();
    const existingNames = new Set(existing.documents.map((p: any) => p.name.toLowerCase().trim()));

    for (const product of products) {
      try {
        const normalizedName = product.name.toLowerCase().trim();
        if (existingNames.has(normalizedName)) {
          results.duplicates.push(product.name);
          continue;
        }
        const added = await this.addProduct(product);
        results.success.push(added);
        existingNames.add(normalizedName);
      } catch (error: any) {
        results.failed.push({ name: product.name, error: error.message });
      }
    }
    return results;
  },

  /* --------------------- CATEGORIES --------------------- */
  async addCategory(category: any) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, ID.unique(), category);
  },

  async getCategories() {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.CATEGORIES);
  },

  async getCategoryById(id: string) {
    return databases.getDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, id);
  },

  async updateCategory(id: string, updates: any) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, id, updates);
  },

  async deleteCategory(id: string) {
    return databases.deleteDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, id);
  },

  /* --------------------- CART --------------------- */
  async getCart(userId: string) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.CART, [
      Query.equal("userId", String(userId)),
      Query.orderDesc("$createdAt")
    ]);
  },

  async addToCart({ userId, productId, quantity = 1 }: any) {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CART, [
      Query.equal("userId", String(userId)),
      Query.equal("productId", String(productId))
    ]);

    if (existing.total > 0) {
      const doc = existing.documents[0];
      return databases.updateDocument(DATABASE_ID, COLLECTIONS.CART, doc.$id, {
        quantity: (doc.quantity || 0) + quantity
      });
    }

    return databases.createDocument(DATABASE_ID, COLLECTIONS.CART, ID.unique(), {
      userId: String(userId),
      productId: String(productId),
      quantity
    });
  },

  async removeFromCart(cartItemId: string) {
    return databases.deleteDocument(DATABASE_ID, COLLECTIONS.CART, cartItemId);
  },

  async clearCart(userId: string) {
    const list = await this.getCart(userId);
    await Promise.all(list.documents.map(d => databases.deleteDocument(DATABASE_ID, COLLECTIONS.CART, d.$id)));
  },

  /* --------------------- WISHLIST --------------------- */
  async getWishlist(userId: string) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.WISHLIST, [
      Query.equal("userId", String(userId)),
      Query.orderDesc("$createdAt")
    ]);
  },

  async addToWishlist({ userId, productId }: any) {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WISHLIST, [
      Query.equal("userId", String(userId)),
      Query.equal("productId", String(productId))
    ]);
    if (existing.total > 0) return existing.documents[0];
    return databases.createDocument(DATABASE_ID, COLLECTIONS.WISHLIST, ID.unique(), {
      userId: String(userId),
      productId: String(productId)
    });
  },

  async removeFromWishlist(id: string) {
    return databases.deleteDocument(DATABASE_ID, COLLECTIONS.WISHLIST, id);
  },

  /* --------------------- ORDERS --------------------- */
  async createOrder(payload: OrderPayload) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.ORDERS, ID.unique(), payload);
  },

  async getOrders() {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDERS, [Query.orderDesc("$createdAt")]);
  },

  async updateOrder(id: string, updates: any) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.ORDERS, id, updates);
  },

  async deleteOrder(id: string) {
    return databases.deleteDocument(DATABASE_ID, COLLECTIONS.ORDERS, id);
  },

  /* --------------------- STOCK --------------------- */
  async addStock(stock: any) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.STOCK, ID.unique(), stock);
  },

  async getStocks() {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.STOCK, [Query.orderDesc("$createdAt")]);
  },

  async updateStock(id: string, updates: any) {
    return databases.updateDocument(DATABASE_ID, COLLECTIONS.STOCK, id, updates);
  },

  /* --------------------- REPORTS --------------------- */
  async addReport(report: any) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.REPORTS, ID.unique(), report);
  },

  async getReports() {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.REPORTS, [Query.orderDesc("$createdAt")]);
  },

  /* --------------------- LAB TESTS --------------------- */
  async addLabBooking(booking: any) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.LABS, ID.unique(), booking);
  },

  async getLabBookings(userId: string) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.LABS, [
      Query.equal("userId", String(userId)),
      Query.orderDesc("$createdAt")
    ]);
  },

  async getAllLabBookings() {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.LABS, [Query.orderDesc("$createdAt")]);
  },

  /* --------------------- PRESCRIPTIONS --------------------- */
  async addPrescription(data: any) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.PRESCRIPTIONS, ID.unique(), data);
  },

  async getPrescriptions(userId: string) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.PRESCRIPTIONS, [
      Query.equal("userId", String(userId)),
      Query.orderDesc("$createdAt")
    ]);
  },
  
  async getAllPrescriptions() {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.PRESCRIPTIONS, [
      Query.orderDesc("$createdAt")
    ]);
  },

  /* --------------------- REVIEWS --------------------- */
  async addReview(review: any) {
    return databases.createDocument(DATABASE_ID, COLLECTIONS.REVIEWS, ID.unique(), review);
  },

  async getReviews(productId: string) {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.REVIEWS, [
      Query.equal("productId", String(productId)),
      Query.orderDesc("$createdAt")
    ]);
  },

  async getAllReviews() {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.REVIEWS, [Query.orderDesc("$createdAt")]);
  },

  /* --------------------- PATIENTS --------------------- */
  async getPatients() {
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.PATIENTS, [Query.orderDesc("$createdAt")]);
  }
};
