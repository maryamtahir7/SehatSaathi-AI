import { storage } from "./appwrite";

export async function uploadImage(file) {
  try {
    const response = await storage.createFile(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
        "unique()",
      file
    );
    const url = storage.getFileView(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      response.$id,
      String
    );
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}