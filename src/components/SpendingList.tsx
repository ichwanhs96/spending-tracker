'use client';

import { useState, useMemo } from 'react';
import { SpendingEntry, SPENDING_CATEGORIES, USER_OPTIONS, CURRENCY_OPTIONS } from '@/types/spending';

interface SpendingListProps {
  entries: SpendingEntry[];
}

export default function SpendingList({ entries }: SpendingListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const getCategoryInfo = (category: string) => {
    return SPENDING_CATEGORIES.find(cat => cat.value === category) || 
           { emoji: '📝', label: 'Other' };
  };

  const getUserInfo = (user: string) => {
    return USER_OPTIONS.find(u => u.value === user) || 
           { emoji: '🤝', label: 'Sharing' };
  };

  const getCurrencyInfo = (currency: string) => {
    return CURRENCY_OPTIONS.find(c => c.value === currency) || 
           { emoji: '🇯🇵', symbol: '¥', label: 'Japanese Yen' };
  };

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' || currency === 'IDR' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' || currency === 'IDR' ? 0 : 2,
    });
    return formatter.format(amount);
  };

  const totalAmount = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [entries]);

  // Pagination logic
  const totalPages = Math.ceil(entries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = entries.slice(startIndex, endIndex);

  // Reset to first page when entries change
  useMemo(() => {
    setCurrentPage(1);
  }, [entries]);

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
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs sm:text-sm text-blue-600">Total Expenses</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-900">
              {entries.length > 0 ? formatAmount(totalAmount, entries[0].currency) : '¥0'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-blue-600">Entries</p>
            <p className="text-base sm:text-lg font-semibold text-blue-900">{entries.length}</p>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No expenses found for the selected date range.</p>
          </div>
        ) : (
          <>
            {paginatedEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start space-x-3 mb-2">
                      <span className="text-xl sm:text-2xl flex-shrink-0">
                        {getCategoryInfo(entry.category).emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base break-words">
                          {entry.description}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <span className="mr-1">📅</span>
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center">
                            <span className="mr-1">{getUserInfo(entry.user).emoji}</span>
                            <span className="truncate">{getUserInfo(entry.user).label}</span>
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center">
                            <span className="mr-1">{getCurrencyInfo(entry.currency).emoji}</span>
                            <span className="truncate">{getCurrencyInfo(entry.currency).symbol}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      {formatAmount(entry.amount, entry.currency)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {getCategoryInfo(entry.category).label}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, entries.length)} of {entries.length} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm rounded-md transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 