'use client';

import { useState, useEffect, useMemo } from 'react';
import SpendingForm from '@/components/SpendingForm';
import SpendingList from '@/components/SpendingList';
import SpendingCharts from '@/components/SpendingCharts';
import VoiceSpending from '@/components/VoiceSpending';
import BillScan from '@/components/BillScan';
import Login from '@/components/Login';
import { useAuth } from '@/contexts/AuthContext';
import { SpendingEntry } from '@/types/spending';

export default function Home() {
  const { user, loading, logout, isAuthorized } = useAuth();
  const [spendingEntries, setSpendingEntries] = useState<SpendingEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manual' | 'voice' | 'bill-scan'>('voice');
  const [activeView, setActiveView] = useState<'list' | 'charts'>('list');
  
  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quickFilter, setQuickFilter] = useState<'7days' | '30days' | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let filtered = [...spendingEntries];

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

    // Sort by timestamp in descending order (latest first)
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [spendingEntries, startDate, endDate, quickFilter]);

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

  useEffect(() => {
    if (isAuthorized) {
      fetchSpendingData();
    }
  }, [isAuthorized]);

  // Handle clicking outside mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('mobile-user-menu');
      const button = document.getElementById('mobile-user-button');
      
      if (menu && button && !menu.contains(event.target as Node) && !button.contains(event.target as Node)) {
        menu.classList.add('hidden');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSpendingData = async () => {
    try {
      const response = await fetch('/api/spending');
      if (response.ok) {
        const data = await response.json();
        setSpendingEntries(data);
      }
    } catch (error) {
      console.error('Error fetching spending data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleAddSpending = async (entry: Omit<SpendingEntry, 'id' | 'timestamp'>) => {
    try {
      const response = await fetch('/api/spending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (response.ok) {
        // Refresh the data
        fetchSpendingData();
      }
    } catch (error) {
      console.error('Error adding spending entry:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user || !isAuthorized) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <img src="/konyuu-logo.webp" alt="Konyuu Spending Tracker" className="w-16 h-16 mx-auto" />
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Konyuu
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Spending Tracker
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-gray-900">
                  Konyuu
                </h1>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* User Info - Hidden on mobile */}
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-600">Welcome,</p>
                <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                  {user.email}
                </p>
              </div>
              
              {/* Mobile User Menu */}
              <div className="sm:hidden relative">
                <button
                  id="mobile-user-button"
                  onClick={() => {
                    const menu = document.getElementById('mobile-user-menu');
                    if (menu) {
                      menu.classList.toggle('hidden');
                    }
                  }}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Mobile Dropdown Menu */}
                <div
                  id="mobile-user-menu"
                  className="hidden absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                >
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden sm:block bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Add New Expense
              </h2>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('voice')}
                  className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'voice'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎤 Voice Input
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'manual'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📝 Manual Entry
                </button>
                <button
                  onClick={() => setActiveTab('bill-scan')}
                  className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'bill-scan'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📸 Bill Scan (beta)
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'voice' ? (
                <VoiceSpending onSpendingDetected={handleAddSpending} />
              ) : activeTab === 'bill-scan' ? (
                <BillScan onSpendingDetected={handleAddSpending} />
              ) : (
                <SpendingForm onSubmit={handleAddSpending} />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Recent Expenses
                </h2>
                
                {/* View Toggle */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveView('list')}
                    className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                      activeView === 'list'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📋 List
                  </button>
                  <button
                    onClick={() => setActiveView('charts')}
                    className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                      activeView === 'charts'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📊 Charts
                  </button>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                  >
                    {showFilters ? 'Hide' : 'Show'} filters
                  </button>
                </div>

                {showFilters && (
                  <div className="space-y-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    {/* Quick Filters */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                        <button
                          onClick={() => handleQuickFilter('7days')}
                          className={`px-3 py-2 text-xs sm:text-sm rounded-md transition-colors ${
                            quickFilter === '7days'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Last 7 days
                        </button>
                        <button
                          onClick={() => handleQuickFilter('30days')}
                          className={`px-3 py-2 text-xs sm:text-sm rounded-md transition-colors ${
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            handleDateChange();
                          }}
                          className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            handleDateChange();
                          }}
                          className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(startDate || endDate || quickFilter) && (
                      <button
                        onClick={clearFilters}
                        className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-xs sm:text-sm"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}

                {/* Active Filter Feedback */}
                {quickFilter && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center">
                        <span className="text-blue-600 mr-2">✓</span>
                        <span className="text-blue-800 text-xs sm:text-sm">
                          Showing expenses from the last {quickFilter === '7days' ? '7' : '30'} days
                        </span>
                      </div>
                      <button
                        onClick={clearFilters}
                        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm self-start sm:self-auto"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {dataLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : activeView === 'list' ? (
                <SpendingList entries={filteredEntries} />
              ) : (
                <SpendingCharts entries={filteredEntries} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
