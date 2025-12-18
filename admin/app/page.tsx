// app/page.tsx - удалите импорт mockData
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  Users, CreditCard, Tag, BarChart3, 
  Calendar, ArrowUpRight, MoreVertical
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalExpenses: number;
  totalCategories: number;
  recentExpenses: any[];
  totalAmount: number;
  newCategories: number;
  newUsers: number;
  newExpenses: number;
  avgReceiptChange: string;
  realAvgReceipt: number;
  byCategory?: Array<{ name: string; total: number; count: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalExpenses: 0,
    totalCategories: 0,
    recentExpenses: [],
    totalAmount: 0,
    newCategories: 0,
    newUsers: 0,
    newExpenses: 0,
    avgReceiptChange: '+0%',
    realAvgReceipt: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Загружаем данные...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Пользователи',
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      change: stats.newUsers > 0 ? `+${stats.newUsers} за месяц` : 'Без изменений',
      link: '/users'
    },
    {
      title: 'Всего расходов',
      value: stats.totalExpenses,
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-green-500',
      change: `${stats.totalAmount.toLocaleString()} ₽`,
      link: '/expenses'
    },
    {
      title: 'Категории',
      value: stats.totalCategories,
      icon: <Tag className="w-6 h-6" />,
      color: 'bg-purple-500',
      change: stats.newCategories > 0 ? `+${stats.newCategories} новых` : 'Без изменений',
      link: '/categories'
    },
    {
      title: 'Средний чек',
      value: stats.realAvgReceipt > 0 ? `${stats.realAvgReceipt.toLocaleString()} ₽` : '0 ₽',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-amber-500',
      change: stats.avgReceiptChange,
      link: '/reports'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Дашборд</h1>
          <p className="text-gray-600">Обзор системы учета расходов</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-200">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-700">Сегодня, {new Date().toLocaleDateString('ru-RU')}</span>
          </div>
          
          {lastUpdated && (
            <div className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Обновлено: {lastUpdated.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.color} p-3 rounded-xl text-white`}>
                {card.icon}
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-2">
              <p className="text-sm text-gray-500 font-medium">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                card.change.includes('+') 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-600 bg-gray-100'
              }`}>
                {card.change}
              </span>
              <a 
                href={card.link}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center group"
              >
                Подробнее
                <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Последние расходы */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Последние расходы</h2>
              <p className="text-gray-600 text-sm mt-1">Недавно добавленные траты пользователей</p>
            </div>
            <a 
              href="/expenses" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
            >
              Смотреть все
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          {stats.recentExpenses.length > 0 ? (
            <div className="space-y-4">
                {stats.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors group">
                    <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-bold">₽</span>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>Трата: {new Date(expense.date).toLocaleDateString('ru-RU')}</span>
                        <span>•</span>
                        <span>Добавлено: {new Date(expense.createdAt).toLocaleDateString('ru-RU')}</span>
                        </div>
                    </div>
                    </div>
                    <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{expense.amount.toLocaleString()} ₽</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Активен
                    </span>
                    </div>
                </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Пока нет расходов</p>
              <p className="text-gray-400 text-sm">Пользователи еще не добавляли траты</p>
            </div>
          )}
        </div>

        {/* Статистика по категориям */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Расходы по категориям</h2>
          
          <div className="space-y-4">
            {stats.byCategory && stats.byCategory.length > 0 ? (
              stats.byCategory.map((category, index) => {
                const percentage = stats.totalAmount > 0 
                  ? Math.round((category.total / stats.totalAmount) * 100)
                  : 0;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500'];
                const color = colors[index % colors.length];
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{category.name}</span>
                      <span className="text-gray-900 font-semibold">{category.total.toLocaleString()} ₽</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`${color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{percentage}% от общих расходов</span>
                      <span>{category.count} записей</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                Нет данных по категориям
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Общая сумма</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAmount.toLocaleString()} ₽</p>
              </div>
              <a 
                href="/reports" 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
              >
                Детальный отчет
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}