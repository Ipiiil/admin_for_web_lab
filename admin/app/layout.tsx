// app/layout.tsx - обновленная проверка авторизации
'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const isLoginPage = pathname === '/login';
      const isRegisterPage = pathname === '/register';
      const isPublicPage = isLoginPage || isRegisterPage;

      if (!token && !isPublicPage) {
        // Нет токена и не на публичной странице
        setIsAuthenticated(false);
        router.push('/login');
        return;
      }

      if (token && isPublicPage) {
        // Есть токен и на странице входа/регистрации
        setIsAuthenticated(true);
        router.push('/');
        return;
      }

      if (token && !isPublicPage) {
        // Проверяем валидность токена
        try {
          // Попробуем получить данные пользователя
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(userData);
          
          // Можно также проверить токен через апи, если есть эндпоинт
          // await api.getWithAuth('/api/auth/verify');
          
          setIsAuthenticated(true);
        } catch (error) {
          // Токен невалидный
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          
          if (!isPublicPage) {
            router.push('/login');
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Показываем только login/register страницы если не авторизован
  if (pathname === '/login' || pathname === '/register') {
    return (
      <html lang="ru">
        <body className="bg-gray-50">
          {children}
        </body>
      </html>
    );
  }

  // Для остальных страниц проверяем авторизацию
  if (isAuthenticated === null) {
    return (
      <html lang="ru">
        <body className="bg-gray-50">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Проверка авторизации...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  if (!isAuthenticated) {
    return (
      <html lang="ru">
        <body className="bg-gray-50">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Доступ запрещен</p>
              <a 
                href="/login" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Войти
              </a>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="ru">
      <body className="bg-gray-50">
        <div className="min-h-screen">
          <Header user={user} />
          <div className="p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}

// Обновленный Header компонент
function Header({ user }: { user: any }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navItems = [
    { href: '/', label: 'Дашборд', icon: '📊' },
    { href: '/users', label: 'Пользователи', icon: '👥', adminOnly: true },
    { href: '/expenses', label: 'Расходы', icon: '💰' },
    { href: '/categories', label: 'Категории', icon: '🏷️' },
    { href: '/reports', label: 'Отчеты', icon: '📈' },
  ];

  const pathname = usePathname();

  // Фильтруем пункты меню по роли
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Трекер расходов</h1>
            <p className="text-sm text-gray-500">
              {user?.role === 'admin' ? 'Панель администратора' : 'Личный кабинет'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-medium text-gray-900">{user?.name || user?.email}</p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Выйти
          </button>
        </div>
      </div>
      
      <nav className="mt-4 flex space-x-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <a 
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}