import { Client, Databases, Account, Storage, ID, Query, OAuthProvider } from 'appwrite';

// Initialize the Appwrite Client
const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database & Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

export const COLLECTIONS = {
    PRODUCTS: process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID || process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION || 'products',
    CATEGORIES: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_ID || 'category',
    CART: process.env.NEXT_PUBLIC_APPWRITE_CART_ID || 'cart',
    WISHLIST: process.env.NEXT_PUBLIC_APPWRITE_WISHLIST_ID || 'wishlist',
    ORDERS: process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION || 'orders',
    REPORTS: process.env.NEXT_PUBLIC_APPWRITE_REPORTS_ID || 'report',
    STOCK: process.env.NEXT_PUBLIC_APPWRITE_STOCK_ID || 'stock',
    LABS: process.env.NEXT_PUBLIC_APPWRITE_LAB_ID || 'lab_test',
    PRESCRIPTIONS: process.env.NEXT_PUBLIC_APPWRITE_PRESCRIPTION_ID || 'prescription',
    REVIEWS: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_ID || 'review',
    PATIENTS: process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION || 'patients',
};

export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';

// Backward compatibility exports (to avoid breaking existing code immediately)
export const PATIENTS_COLLECTION_ID = COLLECTIONS.PATIENTS;
export const ORDERS_COLLECTION_ID = COLLECTIONS.ORDERS;
export const PRODUCTS_COLLECTION_ID = COLLECTIONS.PRODUCTS;
export const REVIEWS_COLLECTION_ID = COLLECTIONS.REVIEWS;
export const LABS_COLLECTION_ID = COLLECTIONS.LABS;
export const PRESCRIPTION_COLLECTION_ID = COLLECTIONS.PRESCRIPTIONS;
export const CATEGORIES_COLLECTION_ID = COLLECTIONS.CATEGORIES;
export const STOCK_COLLECTION_ID = COLLECTIONS.STOCK;
export const REPORTS_COLLECTION_ID = COLLECTIONS.REPORTS;

export { ID, Query, OAuthProvider };
