// lib/api.ts - ПОЛНОСТЬЮ ПЕРЕРАБОТАННЫЙ ВАРИАНТ
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  status: number;
  data?: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Базовые функции API
export const api = {
  // Авторизация
  async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Ошибка авторизации', response.status, errorData);
    }
    
    
    
    const data = await response.json();
    
    // Добавляем user объект если его нет в ответе
    return {
      ...data,
      user: data.user || {
        email: email,
        name: email.split('@')[0] || 'Пользователь',
        role: 'user'
      }
    };
  },

  // Регистрация
  async register(email: string, password: string, name: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password, name }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Ошибка регистрации', response.status, errorData);
    }
    
    const data = await response.json();
    
    // Добавляем user объект если его нет в ответе
    return {
      ...data,
      user: data.user || {
        email: email,
        name: name,
        role: 'user'
      }
    };
  },

  // Обновление токена 
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

  // Универсальный метод запроса с авто-обновлением токена
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    
    // Если 401 - пробуем обновить токен
    if (response.status === 401) {
      try {
        const newTokens = await this.refresh();
        localStorage.setItem('token', newTokens.accessToken);
        
        return this.request(endpoint, options);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new ApiError('Сессия истекла', 401);
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Ошибка запроса', response.status, errorData);
    }
        
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }
    
    return response.json();
  },
       

  // === ПОЛЬЗОВАТЕЛИ ===
  async getUsers(): Promise<any[]> {
    const response = await this.request('/api/admin/users');
    return Array.isArray(response) ? response : response?.users || response?.data || [];
  },

  async getUser(id: string): Promise<any> {
    return this.request(`/api/admin/users/${id}`);
  },

  async createUser(data: { email: string; password: string; name: string; role?: string }): Promise<any> {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUser(id: string, data: any): Promise<any> {
    return this.request(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string): Promise<void> {
    await this.request(`/api/admin/users/${id}`, { method: 'DELETE' });
  },

  // === КАТЕГОРИИ ===
  async getCategories(): Promise<any[]> {
    const response = await this.request('/api/admin/categories');
    return Array.isArray(response) ? response : [];
  },

  async createCategory(data: { name: string; description?: string }): Promise<any> {
    return this.request('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: any): Promise<any> {
    return this.request(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await this.request(`/api/admin/categories/${id}`, { method: 'DELETE' });
  },

  // === РАСХОДЫ ===
  async getExpenses(): Promise<any[]> {
    const response = await this.request('/api/expenses');
    return Array.isArray(response) ? response : [];
  },

  async createExpense(data: {
    amount: number;
    description: string;
    date: string;
    categoryId: string;
    note?: string;
  }): Promise<any> {
    return this.request('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateExpense(id: string, data: any): Promise<any> {
    return this.request(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteExpense(id: string): Promise<void> {
    await this.request(`/api/expenses/${id}`, { method: 'DELETE' });
  },

  // === ДАШБОРД ===
  async getDashboardStats(): Promise<any> {
    return this.request('/api/admin/dashboard');
  },

  // === ОТЧЕТЫ ===
  async getReports(period?: string): Promise<any> {
    const endpoint = period ? `/api/reports?period=${period}` : '/api/reports';
    return this.request(endpoint);
  }
};