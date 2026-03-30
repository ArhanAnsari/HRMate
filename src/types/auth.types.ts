export type UserRole = "admin" | "employee" | "manager";

export interface User {
  $id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
  companyName: string;
}

export interface PasswordResetRequest {
  email: string;
}
