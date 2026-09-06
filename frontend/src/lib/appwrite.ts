import { Client, Account, Databases, Storage, Query, ID } from "appwrite";

// ─── Appwrite config from .env.local ───────────────────────────────────────
const ENDPOINT  = import.meta.env.VITE_APPWRITE_ENDPOINT      || import.meta.env.NEXT_PUBLIC_APPWRITE_ENDPOINT      || "https://cloud.appwrite.io/v1";
const PROJECT   = import.meta.env.VITE_APPWRITE_PROJECT_ID    || import.meta.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID    || "68b4b13600160f5788f7";
const DB        = import.meta.env.VITE_APPWRITE_DATABASE_ID   || import.meta.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID   || "68b5e8e90037e48116df";
const BUCKET    = import.meta.env.VITE_APPWRITE_BUCKET_ID     || import.meta.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID     || "68b5f5b80028ec70facd";

// Collections
export const COL = {
  products:   import.meta.env.NEXT_PUBLIC_APPWRITE_TABLE_ID              || "products",
  categories: import.meta.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_ID        || "category",
  cart:       import.meta.env.NEXT_PUBLIC_APPWRITE_CART_ID              || "cart",
  orders:     import.meta.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION    || "orders",
  users:      import.meta.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION  || "patients",
};

// ─── Client singleton ────────────────────────────────────────────────────────
export const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT);
export const account    = new Account(client);
export const databases  = new Databases(client);
export const storage    = new Storage(client);

export { Query, ID, DB, BUCKET };

// ─── Auth helpers ────────────────────────────────────────────────────────────
export const authService = {
  async register(name: string, email: string, password: string) {
    const user = await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    return user;
  },
  async login(email: string, password: string) {
    return account.createEmailPasswordSession(email, password);
  },
  async logout() {
    return account.deleteSession("current");
  },
  async getUser() {
    try { return await account.get(); }
    catch { return null; }
  },
};

// ─── Product helpers ─────────────────────────────────────────────────────────
export const productService = {
  async list(limit = 50) {
    return databases.listDocuments(DB, COL.products, [Query.limit(limit), Query.orderDesc("$createdAt")]);
  },
  async create(data: Record<string, unknown>) {
    return databases.createDocument(DB, COL.products, ID.unique(), data);
  },
  async update(id: string, data: Record<string, unknown>) {
    return databases.updateDocument(DB, COL.products, id, data);
  },
  async remove(id: string) {
    return databases.deleteDocument(DB, COL.products, id);
  },
  async uploadImage(file: File) {
    const res = await storage.createFile(BUCKET, ID.unique(), file);
    return storage.getFilePreview(BUCKET, res.$id).href;
  },
};

// ─── Order helpers ───────────────────────────────────────────────────────────
export const orderService = {
  async create(data: Record<string, unknown>) {
    return databases.createDocument(DB, COL.orders, ID.unique(), data);
  },
  async list() {
    return databases.listDocuments(DB, COL.orders, [Query.orderDesc("$createdAt")]);
  },
  async userOrders(userId: string) {
    return databases.listDocuments(DB, COL.orders, [Query.equal("userId", userId), Query.orderDesc("$createdAt")]);
  },
};
