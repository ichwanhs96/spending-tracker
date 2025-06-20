'use client';

import { useState, useMemo } from 'react';
import { SpendingEntry, SPENDING_CATEGORIES, USER_OPTIONS } from '@/types/spending';

interface SpendingListProps {
  entries: SpendingEntry[];
}

export default function SpendingList({ entries }: SpendingListProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quickFilter, setQuickFilter] = useState<'7days' | '30days' | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const getCategoryInfo = (category: string) => {
    return SPENDING_CATEGORIES.find(cat => cat.value === category) || 
           { emoji: '📝', label: 'Other' };
  };

  const getUserInfo = (user: string) => {
    return USER_OPTIONS.find(u => u.value === user) || 
           { emoji: '🤝', label: 'Sharing' };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    if (startDate && endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return entryDate >= start && entryDate <= end;
      });
    } else if (quickFilter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= sevenDaysAgo;
      });
    } else if (quickFilter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= thirtyDaysAgo;
      });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, startDate, endDate, quickFilter]);

  const totalAmount = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [filteredEntries]);

  const handleQuickFilter = (filter: '7days' | '30days') => {
    setQuickFilter(filter);
    setStartDate('');
    setEndDate('');
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setQuickFilter(null);
  };

  const handleDateChange = () => {
    setQuickFilter(null);
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showFilters ? 'Hide' : 'Show'} filters
          </button>
        </div>

        {showFilters && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleQuickFilter('7days')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    quickFilter === '7days'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => handleQuickFilter('30days')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    quickFilter === '30days'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Last 30 days
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    handleDateChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    handleDateChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(startDate || endDate || quickFilter) && (
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Active Filter Feedback */}
        {quickFilter && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-blue-800 text-sm">
                  Showing expenses from the last {quickFilter === '7days' ? '7' : '30'} days
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600">Total Expenses</p>
            <p className="text-2xl font-bold text-blue-900">{formatAmount(totalAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600">Entries</p>
            <p className="text-lg font-semibold text-blue-900">{filteredEntries.length}</p>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No expenses found for the selected date range.</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">
                      {getCategoryInfo(entry.category).emoji}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{entry.description}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>📅 {new Date(entry.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <span className="mr-1">{getUserInfo(entry.user).emoji}</span>
                          {getUserInfo(entry.user).label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatAmount(entry.amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getCategoryInfo(entry.category).label}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 