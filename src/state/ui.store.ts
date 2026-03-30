import { create } from "zustand";

interface UIStore {
  // Modal states
  isLoginModalOpen: boolean;
  isSignupModalOpen: boolean;
  isMenuModalOpen: boolean;
  isConfirmDialogOpen: boolean;

  // Toast/Alert states
  toastMessage: string | null;
  toastType: "success" | "error" | "info" | "warning" | null;
  isLoading: boolean;

  // Modal actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openSignupModal: () => void;
  closeSignupModal: () => void;
  openMenuModal: () => void;
  closeMenuModal: () => void;
  openConfirmDialog: () => void;
  closeConfirmDialog: () => void;

  // Toast actions
  showToast: (
    message: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
  hideToast: () => void;

  // Loading state
  setLoading: (isLoading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isLoginModalOpen: false,
  isSignupModalOpen: false,
  isMenuModalOpen: false,
  isConfirmDialogOpen: false,
  toastMessage: null,
  toastType: null,
  isLoading: false,

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  openSignupModal: () => set({ isSignupModalOpen: true }),
  closeSignupModal: () => set({ isSignupModalOpen: false }),
  openMenuModal: () => set({ isMenuModalOpen: true }),
  closeMenuModal: () => set({ isMenuModalOpen: false }),
  openConfirmDialog: () => set({ isConfirmDialogOpen: true }),
  closeConfirmDialog: () => set({ isConfirmDialogOpen: false }),

  showToast: (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
  ) => {
    set({ toastMessage: message, toastType: type });
    // Auto-hide after 4 seconds
    setTimeout(() => {
      set({ toastMessage: null, toastType: null });
    }, 4000);
  },

  hideToast: () => set({ toastMessage: null, toastType: null }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
