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
  // Авторизация - ИСПРАВЛЕННЫЙ ПУТЬ
  async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Ошибка авторизации', response.status, errorData);
    }
    
    return response.json();
  },

  // Регистрация - ИСПРАВЛЕННЫЙ ПУТЬ
  async register(email: string, password: string, name: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Ошибка регистрации', response.status, errorData);
    }
    
    return response.json();
  },

  // Обновление токена - НОВАЯ ЛОГИКА
  async refresh(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new ApiError('Нет refresh токена', 401);
    }
    
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      throw new ApiError('Ошибка обновления токена', response.status);
    }
    
    return response.json();
  },

  // Универсальный метод запроса с авто-обновлением токена
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
    
    // Если 401 - пробуем обновить токен
    if (response.status === 401) {
      try {
        const newTokens = await this.refresh();
        
        // Сохраняем новые токены
        localStorage.setItem('token', newTokens.accessToken);
        localStorage.setItem('refreshToken', newTokens.refreshToken);
        
        // Повторяем запрос с новым токеном
        headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new ApiError(errorData.message || 'Ошибка запроса', retryResponse.status, errorData);
        }
        
        // Если ответ пустой (например, для DELETE)
        if (retryResponse.status === 204 || retryResponse.headers.get('content-length') === '0') {
          return {} as T;
        }
        
        return retryResponse.json();
        
      } catch (refreshError) {
        // Если не удалось обновить - разлогиниваем
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        throw new ApiError('Сессия истекла. Пожалуйста, войдите снова.', 401);
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

  // === ПОЛЬЗОВАТЕЛИ ===
  async getUsers(): Promise<any[]> {
    const response = await this.request('/api/admin/users');
    return Array.isArray(response) ? response : [];
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
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string): Promise<void> {
    await this.request(`/api/admin/users/${id}`, { method: 'DELETE' });
  },

  // === КАТЕГОРИИ ===
  async getCategories(): Promise<any[]> {
    const response = await this.request('/api/categories');
    return Array.isArray(response) ? response : [];
  },

  async createCategory(data: { name: string; description?: string }): Promise<any> {
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