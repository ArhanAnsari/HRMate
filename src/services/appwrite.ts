import { Account, Client, Databases, Functions, Storage } from "appwrite";
import { APPWRITE_CONFIG } from "../config/env";

// Initialize Appwrite client
const client = new Client();

try {
  client
    .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
    .setProject(APPWRITE_CONFIG.PROJECT_ID);

  console.log("✅ Appwrite client initialized");
} catch (error) {
  console.error("❌ Failed to initialize Appwrite client:", error);
}

// Initialize services
export const appwriteClient = client;
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Helper function to handle Appwrite errors
export const handleAppwriteError = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  if (error.response?.message) {
    return error.response.message;
  }
  return "An unknown error occurred";
};

// Helper to check if user is authenticated
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    await account.get();
    return true;
  } catch {
    return false;
  }
};

// Helper to safely delete any existing session before creating a new one
export const clearSessionIfExists = async (): Promise<void> => {
  try {
    // Check if there's an active session
    await account.get();
    // If we get here, there's an active session - delete it
    try {
      await account.deleteSession("current");
    } catch {
      // Session might already be gone, ignore
    }
  } catch {
    // No active session, safe to proceed
  }
};
