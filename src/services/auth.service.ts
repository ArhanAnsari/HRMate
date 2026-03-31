import { ID, Query } from "appwrite";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { LoginCredentials, SignupData, User } from "../types";
import {
  account,
  clearSessionIfExists,
  databases,
  handleAppwriteError,
} from "./appwrite";

const mapToUser = (doc: any, authUser: any): User => {
  return {
    $id: doc?.$id || authUser.$id,
    email: doc?.email || authUser.email,
    name: doc?.name || doc?.full_name || authUser.name || "User",
    role: (doc?.role || "employee") as User["role"],
    companyId: doc?.companyId || doc?.company_id || "",
    phone: doc?.phone,
    avatar: doc?.avatar || doc?.profile_image,
    createdAt:
      doc?.createdAt ||
      doc?.created_at ||
      authUser.$createdAt ||
      new Date().toISOString(),
    updatedAt: doc?.updatedAt || doc?.updated_at || new Date().toISOString(),
  };
};

/**
 * Auth Service - Handles user authentication and session management
 */
export const authService = {
  /**
   * Sign up a new user
   */
  async signup(data: SignupData): Promise<User> {
    try {
      // Clear any existing session before creating a new account
      await clearSessionIfExists();

      // Create auth account
      await account.create(ID.unique(), data.email, data.password, data.name);

      // Create session for immediate authenticated flow
      await account.createEmailPasswordSession(data.email, data.password);

      const authUser = await account.get();

      // Create company document
      let companyId = "";
      try {
        const now = new Date().toISOString();
        const company = await databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.COMPANIES,
          ID.unique(),
          {
            name: data.companyName,
            industry: "Other",
            subscription_tier: "free",
            created_by: authUser.$id,
            created_at: now,
            updated_at: now,
          },
        );
        companyId = company.$id;
      } catch {
        companyId = "";
      }

      // Create user document
      try {
        const now = new Date().toISOString();
        const user = await databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.USERS,
          ID.unique(),
          {
            email: data.email,
            full_name: data.name,
            role: "admin",
            company_id: companyId,
            is_active: true,
            created_at: now,
            updated_at: now,
          },
        );
        return mapToUser(user, authUser);
      } catch {
        return mapToUser(null, authUser);
      }
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Clear any existing session before creating a new one
      await clearSessionIfExists();

      // Create session
      await account.createEmailPasswordSession(
        credentials.email,
        credentials.password,
      );

      // Get current user from database
      const user = await this.getCurrentUser();
      return user;
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },

  /**
   * Get current logged-in user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const authUser = await account.get();

      try {
        // Try by email first (works with both old and new schemas)
        const byEmail = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.USERS,
          [Query.equal("email", authUser.email)],
        );

        if (byEmail.documents.length > 0) {
          return mapToUser(byEmail.documents[0], authUser);
        }
      } catch {
        // Ignore profile lookup errors and continue with auth account fallback.
      }

      return mapToUser(null, authUser);
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession("current");
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await account.get();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await account.createRecovery(
        email,
        `${process.env.EXPO_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
      );
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(
    userId: string,
    secret: string,
    password: string,
    confirmPassword: string,
  ): Promise<void> {
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      await account.updateRecovery(userId, secret, password);
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },
};
