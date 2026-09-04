import { storage, BUCKET_ID, ID } from '../lib/appwrite';

export const storageService = {
  // Upload Image
  async uploadImage(file: File) {
    try {
      if (!BUCKET_ID) throw new Error("Storage Bucket ID is not configured.");
      
      const response = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file
      );

      // Get the file view URL
      const url = storage.getFileView(
        BUCKET_ID,
        response.$id
      );
      
      return {
        id: response.$id,
        url: url
      };
    } catch (error: any) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  // Delete Image
  async deleteImage(fileId: string) {
    try {
      return await storage.deleteFile(BUCKET_ID, fileId);
    } catch (error: any) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }
};
