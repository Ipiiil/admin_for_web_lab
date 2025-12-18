// app/reports/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ReportData {
  totalExpenses: number;
  averagePerUser: number;
  byCategory: Array<{ name: string; total: number; count: number }>;
  byUser: Array<{ email: string; total: number; count: number }>;
  recentExpenses: Array<{ id: string; amount: number; description: string; date: string }>;
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadReport();
  }, [period]);

  const loadReport = async () => {
    try {
      const data = await api.getReports(period);
      setReport(data);
    } catch (error) {
      console.error('Ошибка загрузки отчета:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Загрузка отчета...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет данных</h3>
          <p className="text-gray-600">Не удалось загрузить отчет</p>
          <button 
            onClick={loadReport}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Отчеты и статистика</h1>
        
        <div className="flex space-x-2">
          {['week', 'month', 'year', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded text-sm ${period === p ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              {p === 'week' ? 'Неделя' : 
               p === 'month' ? 'Месяц' : 
               p === 'year' ? 'Год' : 'Все время'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border shadow">
          <h3 className="text-lg font-semibold mb-4">Общая статистика</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Общая сумма расходов</p>
              <p className="text-3xl font-bold text-green-600">{report.totalExpenses.toLocaleString()} ₽</p>
            </div>
            <div>
              <p className="text-gray-600">Среднее на пользователя</p>
              <p className="text-2xl font-bold text-blue-600">{report.averagePerUser.toLocaleString()} ₽</p>
            </div>
            <div>
              <p className="text-gray-600">Период</p>
              <p className="text-lg">
                {period === 'week' ? 'За неделю' : 
                 period === 'month' ? 'За месяц' : 
                 period === 'year' ? 'За год' : 'За все время'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow">
          <h3 className="text-lg font-semibold mb-4">Расходы по категориям</h3>
          <div className="space-y-3">
            {report.byCategory.map((cat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{cat.name}</span>
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-green-600">{cat.total.toLocaleString()} ₽</span>
                  <span className="text-sm text-gray-500">({cat.count} записей)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Таблицы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow">
          <h3 className="text-lg font-semibold mb-4">Расходы по пользователям</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Пользователь</th>
                  <th className="text-left py-2">Сумма</th>
                  <th className="text-left py-2">Записей</th>
                </tr>
              </thead>
              <tbody>
                {report.byUser.map((user, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2">{user.email}</td>
                    <td className="py-2 font-medium text-green-600">{user.total.toLocaleString()} ₽</td>
                    <td className="py-2">{user.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow">
          <h3 className="text-lg font-semibold mb-4">Последние расходы</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Сумма</th>
                  <th className="text-left py-2">Описание</th>
                  <th className="text-left py-2">Дата</th>
                </tr>
              </thead>
              <tbody>
                {report.recentExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{exp.amount} ₽</td>
                    <td className="py-2">{exp.description}</td>
                    <td className="py-2">{new Date(exp.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}