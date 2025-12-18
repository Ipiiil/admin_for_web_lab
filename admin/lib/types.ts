// lib/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  note?: string;
  date: string;
  createdAt: string;
  userId: string;
  categoryId: string;
  user?: User;
  category?: Category;
}

export interface DashboardStats {
  totalUsers: number;
  totalExpenses: number;
  totalCategories: number;
  totalAmount: number;
  newCategories: number;
  newUsers: number;
  newExpenses: number;
  avgReceiptChange: string;
  realAvgReceipt: number;
  recentExpenses: Expense[];
  byCategory: Array<{ name: string; total: number; count: number }>;
  byUser: Array<{ email: string; total: number; count: number }>;
}

export interface ReportData {
  totalExpenses: number;
  averagePerUser: number;
  byCategory: Array<{ name: string; total: number; count: number }>;
  byUser: Array<{ email: string; total: number; count: number }>;
  recentExpenses: Expense[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}
export interface RegisterResponse extends LoginResponse {}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UsersApiResponse {
  users: User[];
  total: number;
  page?: number;
  limit?: number;
}

export interface CategoriesApiResponse {
  categories: Category[];
  total: number;
}

export interface ExpensesApiResponse {
  expenses: Expense[];
  total: number;
  totalAmount: number;
}

export interface DashboardStatsApiResponse {
  stats: DashboardStats;
}