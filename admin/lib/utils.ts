// lib/utils.ts
export function formatDateTime(dateString: string) {
  try {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ru-RU'),
      time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString('ru-RU')
    };
  } catch (error) {
    return {
      date: 'Неверная дата',
      time: '',
      full: 'Неверная дата'
    };
  }
}

export function formatDateRelative(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дня назад`;
    return formatDateTime(dateString).date;
  } catch (error) {
    return 'Неизвестно';
  }
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
}