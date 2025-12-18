// app/expenses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { formatDateTime, formatDateRelative, formatCurrency } from '@/lib/utils';

interface ExpenseWithDetails {
  id: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  userId: string;
  categoryId: string;
  user?: {
    email: string;
    name?: string;
  };
  category?: {
    name: string;
  };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Удалить эту запись расхода?')) return;
    
    try {
      await api.deleteExpense(id);
      setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить расход');
    }
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Загрузка расходов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Расходы пользователей</h1>
      
      <div className="mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по описанию..."
          className="max-w-md"
        />
      </div>
      
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Сумма</th>
              <th className="text-left p-3">Описание</th>
              <th className="text-left p-3">Дата траты</th>
              <th className="text-left p-3">Добавлено</th>
              <th className="text-left p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(expense => {
              const expenseDate = formatDateTime(expense.date);
              const createdDate = formatDateTime(expense.createdAt);
              
              return (
                <tr key={expense.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{formatCurrency(expense.amount)}</td>
                  <td className="p-3">{expense.description}</td>
                  <td className="p-3">
                    <div>{expenseDate.date}</div>
                    <div className="text-sm text-gray-500">{expenseDate.time}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{formatDateRelative(expense.createdAt)}</div>
                    <div className="text-sm text-gray-500">{createdDate.time}</div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {search ? 'Расходы не найдены' : 'Нет расходов'}
          </div>
        )}
      </div>
    </div>
  );
}