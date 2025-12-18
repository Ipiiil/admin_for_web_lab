// lib/api-types.ts
import type { 
  ApiResponse, 
  User, 
  Category, 
  Expense, 
  DashboardStats, 
  ReportData,
  UsersApiResponse,
  CategoriesApiResponse,
  ExpensesApiResponse,
  DashboardStatsApiResponse
} from './types';

// Экспортируем все типы для удобства
export type { 
  ApiResponse, 
  User, 
  Category, 
  Expense, 
  DashboardStats, 
  ReportData,
  UsersApiResponse,
  CategoriesApiResponse,
  ExpensesApiResponse,
  DashboardStatsApiResponse
};

// API Response типы для конкретных эндпоинтов
export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse extends LoginResponse {}

// Типы для параметров запросов
export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  note?: string;
  date: string;
  categoryId: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: 'user' | 'admin';
}