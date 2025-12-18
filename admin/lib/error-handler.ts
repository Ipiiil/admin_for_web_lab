// lib/error-handler.ts
export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return 'Сессия истекла. Пожалуйста, войдите снова.';
      
      case 403:
        return 'У вас нет доступа к этой странице.';
      
      case 404:
        return 'Ресурс не найден.';
      
      case 422:
        return 'Некорректные данные. Пожалуйста, проверьте введенную информацию.';
      
      case 500:
        return 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
      
      default:
        return error.message || 'Произошла ошибка.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Неизвестная ошибка.';
};

export const showErrorToast = (message: string) => {
  // Можно интегрировать с Toast уведомлениями
  alert(message);
};