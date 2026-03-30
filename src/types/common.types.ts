export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Company {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  industry?: string;
  size?: number;
  logo?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  $id: string;
  companyId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface Notification {
  $id: string;
  userId: string;
  companyId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}
