import AsyncStorage from "@react-native-async-storage/async-storage";
import { ID } from "appwrite";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { databases } from "../services/appwrite";
import { authService } from "../services/auth.service";
import { AuthState } from "../types";

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    companyName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  switchCompany: (newCompanyId: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.login({ email, password });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      signup: async (
        email: string,
        password: string,
        name: string,
        companyName: string,
      ) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Authenticate (creates auth record and logs in)
          const user = await authService.signup({
            email,
            password,
            name,
            companyName,
          });

          // 2. Generate a unique company ID
          const newCompanyId = ID.unique();

          // 3. Store the newly registered user into users_collection with the companyId
          try {
            await databases.createDocument(
              APPWRITE_CONFIG.DATABASE_ID,
              DB_IDS.USERS,
              user.$id, // Use auth user ID for consistency
              {
                email: email,
                full_name: name,
                role: "admin", // first user is usually admin
                company_id: newCompanyId,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            );
          } catch (dbError) {
            console.warn(
              "User may already exist in users_collection or failed to create.",
              dbError,
            );
          }

          // Assign new companyId to user state
          const updatedUser = { ...user, companyId: newCompanyId };

          set({ user: updatedUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Signup failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Logout failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const isAuth = await authService.isAuthenticated();
          if (isAuth) {
            const user = await authService.getCurrentUser();
            // Preserve overridden companyId from local store if needed
            const stateUser = get().user;
            if (stateUser?.companyId && user) {
              user.companyId = stateUser.companyId;
            }
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      switchCompany: (newCompanyId: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, companyId: newCompanyId },
          });
        }
      },
    }),
    {
      name: "hrmate-auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
