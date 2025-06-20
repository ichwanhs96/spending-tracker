'use client';

import { useState, useMemo } from 'react';
import { SpendingEntry, SPENDING_CATEGORIES } from '@/types/spending';

interface SpendingListProps {
  entries: SpendingEntry[];
}

export default function SpendingList({ entries }: SpendingListProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('');
  const [showFilterFeedback, setShowFilterFeedback] = useState(false);

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

  // Filter entries based on date range
  const filteredEntries = useMemo(() => {
    if (!startDate && !endDate) {
      return entries;
    }

    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return entryDate >= start && entryDate <= end;
      } else if (start) {
        return entryDate >= start;
      } else if (end) {
        return entryDate <= end;
      }

      return true;
    });
  }, [entries, startDate, endDate]);

  const totalSpent = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setActiveQuickFilter('');
  };

  const hasActiveFilters = startDate || endDate;

  const showFeedback = (message: string) => {
    setShowFilterFeedback(true);
    setTimeout(() => setShowFilterFeedback(false), 2000);
  };

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
      {/* Filter Controls */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Filter by Date Range</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <svg className={`ml-1 w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Filter Feedback Message */}
        {showFilterFeedback && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-700">Filter applied successfully!</span>
            </div>
          </div>
        )}

        {showFilters && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setActiveQuickFilter('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setActiveQuickFilter('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setStartDate(weekAgo.toISOString().split('T')[0]);
                    setEndDate(today.toISOString().split('T')[0]);
                    setActiveQuickFilter('7days');
                    showFeedback('Filtered to last 7 days');
                  }}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    activeQuickFilter === '7days'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                    setStartDate(monthAgo.toISOString().split('T')[0]);
                    setEndDate(today.toISOString().split('T')[0]);
                    setActiveQuickFilter('30days');
                    showFeedback('Filtered to last 30 days');
                  }}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    activeQuickFilter === '30days'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Last 30 days
                </button>
              </div>
              
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearFilters();
                    showFeedback('Filters cleared');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-blue-600 font-medium">
            {hasActiveFilters ? 'Filtered Total' : 'Total Spent'}
          </p>
          <p className="text-2xl font-bold text-blue-900">{formatAmount(totalSpent)}</p>
          {hasActiveFilters && (
            <p className="text-xs text-blue-600 mt-1">
              {filteredEntries.length} of {entries.length} entries
            </p>
          )}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-500">No expenses found for the selected date range</p>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 mt-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredEntries
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
            })
        )}
      </div>

      {filteredEntries.length > 10 && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            Showing 10 most recent entries
            {hasActiveFilters && ` (filtered)`}
          </p>
        </div>
      )}
    </div>
  );
} 