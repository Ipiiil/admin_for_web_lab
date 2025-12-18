// app/register/page.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    if (typeof window !== 'undefined') {
      console.log('Current URL:', window.location.origin);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Валидация
    if (!form.email || !form.password || !form.confirmPassword || !form.name) {
      setError('Все поля должны быть заполнены');
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setError('Введите корректный email адрес');
      return;
    }
    
    if (form.name.trim().length < 2) {
      setError('Имя должно содержать не менее 2 символов');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting registration with:', {
        email: form.email,
        name: form.name,
        API_URL: process.env.NEXT_PUBLIC_API_URL
      });
      
      // Регистрация
      const data = await api.register(form.email, form.password, form.name.trim());
      
      console.log('Registration successful:', data);
      
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess(true);
        
        // Редирект через 2 секунды
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        throw new Error('Нет токена в ответе от сервера');
      }
    // app/register/page.tsx - ИСПРАВЛЕННЫЙ БЛОК CATCH
} catch (err: unknown) {
  console.error('Raw error object:', err);
  console.error('Error type:', typeof err);
  
  let errorMessage = 'Ошибка регистрации';
  let errorStatus = 0;
  let errorData = {};
  
  // Безопасное извлечение свойств ошибки
  if (err && typeof err === 'object') {
    // Проверяем, есть ли свойство message
    if ('message' in err && typeof (err as any).message === 'string') {
      errorMessage = (err as any).message;
    }
    
    // Проверяем, есть ли свойство status
    if ('status' in err && typeof (err as any).status === 'number') {
      errorStatus = (err as any).status;
    }
    
    // Проверяем, есть ли свойство data
    if ('data' in err) {
      errorData = (err as any).data;
    }
    
    // Если это стандартная ошибка Error
    if (err instanceof Error) {
      errorMessage = err.message;
    }
  }
  
  console.error('Register error details:', {
    message: errorMessage,
    status: errorStatus,
    data: errorData
  });
  
  // Обработка различных ошибок
  if (errorStatus === 409) {
    setError('Пользователь с таким email уже существует');
  } else if (errorStatus === 400) {
    setError('Некорректные данные. Проверьте введенные данные');
  } else if (errorStatus === 422) {
    if (errorData && typeof errorData === 'object' && 'errors' in (errorData as any)) {
      setError((errorData as any).errors.join(', '));
    } else {
      setError('Ошибка валидации данных');
    }
  } else if (errorMessage.includes('Failed to fetch') || errorStatus === 0) {
    setError(`Не удалось подключиться к серверу: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
    
Возможные причины:
1. Бэкенд не запущен или запущен на другом порту
2. Проверьте CORS настройки на бэкенде
3. Порт бэкенда: 3000, порт фронтенда: 3001 (они должны быть разными)`);
  } else {
    setError(errorMessage || 'Ошибка регистрации. Проверьте консоль для деталей.');
  }
}
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Загрузка формы...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Регистрация успешна!</h1>
          <p className="text-gray-600 mb-4">Аккаунт создан. Вы будете перенаправлены на главную страницу...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Перейти сейчас
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Регистрация</h1>
          <p className="text-gray-600 mt-2">Создайте новый аккаунт</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 whitespace-pre-line">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Имя <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Введите ваше имя"
              required
              disabled={loading}
              className={`${error.includes('Имя') ? 'border-red-300' : ''}`}
            />
            <p className="text-xs text-gray-500 mt-1">Не менее 2 символов</p>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              placeholder="email@example.com"
              required
              disabled={loading}
              className={`${error.includes('email') ? 'border-red-300' : ''}`}
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Пароль <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              placeholder="Не менее 6 символов"
              required
              disabled={loading}
              className={`${error.includes('пароль') ? 'border-red-300' : ''}`}
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Подтвердите пароль <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
              placeholder="Повторите пароль"
              required
              disabled={loading}
            />
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full py-2.5"
              size="large"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Регистрация...
                </>
              ) : 'Зарегистрироваться'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <a 
            href="/login" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Уже есть аккаунт? Войти
          </a>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Регистрируясь, вы соглашаетесь с правилами использования сервиса
          </p>
        </div>
      </div>
    </div>
  );
}