// lib/api.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ С ПРАВИЛЬНЫМИ ТИПАМИ
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  status: number;
  data?: any;  // Добавляем необязательное поле data
  
  constructor(message: string, status: number, data?: any) {  // Делаем data необязательным
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;  // Сохраняем data
  }
}

// Базовые функции API
export const api = {
  // Авторизация
  async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_URL}/backend-api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ошибка авторизации');
    }
    
    return response.json();
  },

  // Регистрация
  async register(email: string, password: string, name: string): Promise<any> {
    const response = await fetch(`${API_URL}/backend-api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ошибка регистрации');
    }
    
    return response.json();
  },

  async refresh(): Promise<{ accessToken: string }> {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new ApiError('Ошибка обновления токена', response.status);
    }
    
    return response.json();
  },

  // Универсальные методы запросов
  async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      try {
        const newTokens = await this.refresh();
        localStorage.setItem('token', newTokens.accessToken);
        
        // Повторяем запрос с новым токеном
        return this.request(endpoint, options);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new ApiError('Сессия истекла', 401);
      }
    }
    
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // ignore
      }
      throw new ApiError(errorData.message || 'Ошибка запроса', response.status, errorData);
    }
    
    // Если ответ пустой (например, для DELETE)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }
    
    return response.json();
  },

  // Специфичные методы API
  async getUsers(): Promise<any[]> {
    const response = await this.request('/api/admin/users');
    return Array.isArray(response) ? response : response?.users || response?.data || [];
  },

  async getUser(id: string): Promise<any> {
    return this.request(`/api/admin/users/${id}`);
  },

  async updateUser(id: string, data: any): Promise<any> {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string): Promise<void> {
    await this.request(`/api/admin/users/${id}`, { method: 'DELETE' });
  },

  async getCategories(): Promise<any[]> {
    const response = await this.request('/api/categories');
    return Array.isArray(response) ? response : response?.categories || response?.data || [];
  },

  async createCategory(data: any): Promise<any> {
    return this.request('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: any): Promise<any> {
    return this.request(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await this.request(`/api/categories/${id}`, { method: 'DELETE' });
  },

  async getExpenses(): Promise<any[]> {
    const response = await this.request('/api/expenses');
    return Array.isArray(response) ? response : response?.expenses || response?.data || [];
  },

  async createExpense(data: any): Promise<any> {
    return this.request('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteExpense(id: string): Promise<void> {
    await this.request(`/api/expenses/${id}`, { method: 'DELETE' });
  },

  async getDashboardStats(): Promise<any> {
    return this.request('/api/admin/dashboard');
  },

  async getReports(period?: string): Promise<any> {
    const endpoint = period ? `/api/reports?period=${period}` : '/api/reports';
    return this.request(endpoint);
  }
};