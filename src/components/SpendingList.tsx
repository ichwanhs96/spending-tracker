'use client';

import { SpendingEntry, SPENDING_CATEGORIES } from '@/types/spending';

interface SpendingListProps {
  entries: SpendingEntry[];
}

export default function SpendingList({ entries }: SpendingListProps) {
  const getCategoryInfo = (category: string) => {
    return SPENDING_CATEGORIES.find(cat => cat.value === category) || 
           { emoji: '📝', label: 'Other' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalSpent = entries.reduce((sum, entry) => sum + entry.amount, 0);

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <p className="text-gray-500 text-lg">No expenses recorded yet</p>
        <p className="text-gray-400 text-sm">Add your first expense to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-blue-600 font-medium">Total Spent</p>
          <p className="text-2xl font-bold text-blue-900">{formatAmount(totalSpent)}</p>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {entries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)
          .map((entry) => {
            const categoryInfo = getCategoryInfo(entry.category);
            
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{categoryInfo.emoji}</div>
                  <div>
                    <p className="font-medium text-gray-900">{entry.description}</p>
                    <p className="text-sm text-gray-500">
                      {categoryInfo.label} • {formatDate(entry.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatAmount(entry.amount)}</p>
                </div>
              </div>
            );
          })}
      </div>

      {entries.length > 10 && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            Showing 10 most recent entries
          </p>
        </div>
      )}
    </div>
  );
} 