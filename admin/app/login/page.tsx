// app/login/page.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await api.login(email, password);
      
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);

        if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);}

        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        throw new Error('Нет токена в ответе');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.status === 401) {
        setError('Неверный email или пароль');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Не удалось подключиться к серверу. Проверьте, запущен ли бэк');
      } else {
        setError(err.message || 'Ошибка входа');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Вход в систему</h1>
          <p className="text-gray-600 mt-2">Трекер расходов</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sokolmax13@gmail.ru"
              required
              disabled={loading}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Пароль</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              required
              disabled={loading}
              className="input-field"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-2.5 text-base"
            size="large"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Вход...
              </>
            ) : 'Войти'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <a 
            href="/register" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Нет аккаунта? Зарегистрироваться
          </a>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700 text-center">
            <span className="font-medium">Тестовые данные:</span><br />
            Email: sokolmax13@gmail.ru<br />
            Пароль: 123456789
          </p>
        </div>
      </div>
    </div>
  );
}