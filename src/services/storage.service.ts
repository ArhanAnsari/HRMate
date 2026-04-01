import { ID } from "appwrite";
import { STORAGE_BUCKETS } from "../config/env";
import { storage } from "./appwrite";

export const storageService = {
  /**
   * Upload an avatar image
   * @param file { name: string, type: string, uri: string }
   */
  async uploadAvatar(file: { name: string; type: string; uri: string }) {
    try {
      const response = await storage.createFile(
        STORAGE_BUCKETS.COMPANY_LOGOS, // We can reuse COMPANY_LOGOS bucket for user avatars or define a new one. Let's assume there is an EMPLOYEES bucket. Wait, env.ts has DOCUMENTS, PAYSLIPS, COMPANY_LOGOS. I'll use DOCUMENTS for now.
        ID.unique(),
        file as any,
      );

      const fileUrl = storage
        .getFileView(STORAGE_BUCKETS.COMPANY_LOGOS, response.$id)
        .toString();
      return { fileId: response.$id, url: fileUrl };
    } catch (error) {
      console.error("Failed to upload avatar:", error);
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
