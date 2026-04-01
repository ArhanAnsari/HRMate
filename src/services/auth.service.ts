import { ID } from "appwrite";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { LoginCredentials, SignupData, User } from "../types";
import {
  account,
  clearSessionIfExists,
  databases,
  handleAppwriteError,
} from "./appwrite";

/**
 * Map Appwrite document + auth user → app user
 */
const mapToUser = (doc: any, authUser: any): User => {
  return {
    $id: authUser.$id,
    email: authUser.email,
    name: doc?.full_name || authUser.name || "User",
    role: (doc?.role || "employee") as User["role"],

    // 🔥 CRITICAL FIX: fallback to prefs
    companyId:
      doc?.company_id ||
      authUser?.prefs?.companyId ||
      "",

    phone: doc?.phone,
    avatar: doc?.profile_image,

    createdAt:
      doc?.created_at ||
      authUser.$createdAt ||
      new Date().toISOString(),

    updatedAt:
      doc?.updated_at ||
      new Date().toISOString(),
  };
};

export const authService = {
  /**
   * SIGNUP
   */
  async signup(data: SignupData): Promise<User> {
    try {
      await clearSessionIfExists();

      // 1. Create auth account
      await account.create(ID.unique(), data.email, data.password, data.name);

      // 2. Login immediately
      await account.createEmailPasswordSession(
        data.email,
        data.password
      );

      const authUser = await account.get();
      const now = new Date().toISOString();

      // 3. Create company
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
        }
      );

      const companyId = company.$id;

      // ✅ Save companyId in prefs (CRITICAL)
      await account.updatePrefs({
        companyId: companyId,
      });

      // 4. Create user document (NO SILENT FAIL)
      const userDoc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.USERS,
        authUser.$id,
        {
          email: data.email,
          full_name: data.name,
          role: "admin",
          company_id: companyId,
          is_active: true,
          created_at: now,
          updated_at: now,
        }
      );

      return mapToUser(userDoc, authUser);
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },

  /**
   * LOGIN
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      await clearSessionIfExists();

      await account.createEmailPasswordSession(
        credentials.email,
        credentials.password
      );

      return await this.getCurrentUser();
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },

  /**
   * GET CURRENT USER (FIXED)
   */
  async getCurrentUser(): Promise<User> {
    try {
      const authUser = await account.get();

      try {
        // ✅ BEST: fetch by document ID
        const userDoc = await databases.getDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.USERS,
          authUser.$id
        );

        return mapToUser(userDoc, authUser);
      } catch {
        // ⚠️ fallback to prefs if DB fails
        return mapToUser(null, authUser);
      }
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },

  /**
   * LOGOUT
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession("current");
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },

  /**
   * AUTH CHECK
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
   * PASSWORD RESET
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await account.createRecovery(
        email,
        `${process.env.EXPO_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`
      );
    } catch (error) {
      throw new Error(handleAppwriteError(error));
    }
  },

  async confirmPasswordReset(
    userId: string,
    secret: string,
    password: string,
    confirmPassword: string
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