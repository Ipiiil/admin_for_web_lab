// app/categories/page.tsx - исправленная версия
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Category>({ id: '', name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Введите название категории');
      return;
    }
    
    try {
      const created = await api.createCategory(newCategory);
      setCategories([...categories, created]);
      setNewCategory({ name: '', description: '' });
    } catch (error) {
      console.error('Ошибка создания:', error);
      alert('Не удалось создать категорию');
    }
  };

  const updateCategory = async () => {
    if (!editData.name.trim()) {
      alert('Название категории не может быть пустым');
      return;
    }
    
    if (!editingId) return;
    
    try {
      const updated = await api.updateCategory(editingId, editData);
      setCategories(categories.map(cat => 
        cat.id === editingId ? updated : cat
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Ошибка обновления:', error);
      alert('Не удалось обновить категорию');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Удалить категорию? Это не удалит связанные расходы.')) return;
    
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить категорию');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditData({ ...category });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Загрузка категорий...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Управление категориями</h1>
      
      {/* Форма добавления */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h2 className="text-lg font-semibold mb-4">Добавить новую категорию</h2>
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <label className="block mb-1 text-sm">Название *</label>
            <Input
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              placeholder="Например: Еда, Транспорт..."
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm">Описание</label>
            <Input
              value={newCategory.description}
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
              placeholder="Описание категории..."
            />
          </div>
          <div className="flex items-end">
            <Button onClick={createCategory}>
              Добавить
            </Button>
          </div>
        </div>
      </div>
      
      {/* Список категорий */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Название</th>
              <th className="text-left py-3 px-4">Описание</th>
              <th className="text-left py-3 px-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} className="border-b hover:bg-gray-50">
                {editingId === category.id ? (
                  <>
                    <td className="py-3 px-4">
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Input
                        value={editData.description || ''}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                        className="w-full"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={updateCategory}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded text-sm hover:bg-green-200"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
                        >
                          Отмена
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 font-medium">{category.name}</td>
                    <td className="py-3 px-4 text-gray-600">{category.description || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет категорий. Добавьте первую.
          </div>
        )}
      </div>
    </div>
  );
}