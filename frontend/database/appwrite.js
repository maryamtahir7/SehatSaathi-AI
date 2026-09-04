// src/backend/appwrite.js
import { Client, Account, Databases, Storage } from "appwrite";

// ✅ Initialize Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // e.g. "http://localhost/v1"
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // your project ID

// ✅ Services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage };
