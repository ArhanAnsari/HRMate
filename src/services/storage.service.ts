import { ID } from "react-native-appwrite";
import { STORAGE_BUCKETS } from "../config/env";
import { storage } from "./appwrite";

export const storageService = {
  /**
   * Upload an avatar or any image
   * @param file { name: string, type: string, uri: string }
   */
  async uploadAvatar(file: { name: string; type: string; uri: string }) {
    try {
      const response = await storage.createFile(
        STORAGE_BUCKETS.DOCUMENTS,
        ID.unique(),
        file as any,
      );

      const fileUrl = storage
        .getFileView(STORAGE_BUCKETS.DOCUMENTS, response.$id)
        .toString();
      return { fileId: response.$id, url: fileUrl };
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      throw error;
    }
  },

  /**
   * Upload a company logo
   */
  async uploadCompanyLogo(file: { name: string; type: string; uri: string }) {
    try {
      const response = await storage.createFile(
        STORAGE_BUCKETS.COMPANY_LOGOS,
        ID.unique(),
        file as any,
      );

      const fileUrl = storage
        .getFileView(STORAGE_BUCKETS.COMPANY_LOGOS, response.$id)
        .toString();
      return { fileId: response.$id, url: fileUrl };
    } catch (error) {
      console.error("Failed to upload company logo:", error);
      throw error;
    }
  },

  /**
   * Upload a document (PDF, DOCX)
   */
  async uploadDocument(file: { name: string; type: string; uri: string }) {
    try {
      const response = await storage.createFile(
        STORAGE_BUCKETS.DOCUMENTS,
        ID.unique(),
        file as any,
      );

      const fileUrl = storage
        .getFileView(STORAGE_BUCKETS.DOCUMENTS, response.$id)
        .toString();
      return { fileId: response.$id, url: fileUrl };
    } catch (error) {
      console.error("Failed to upload document:", error);
      throw error;
    }
  },
};
