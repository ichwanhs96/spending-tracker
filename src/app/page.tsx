'use client';

import { useState, useEffect } from 'react';
import SpendingForm from '@/components/SpendingForm';
import SpendingList from '@/components/SpendingList';
import VoiceSpending from '@/components/VoiceSpending';
import Login from '@/components/Login';
import { useAuth } from '@/contexts/AuthContext';
import { SpendingEntry } from '@/types/spending';

export default function Home() {
  const { user, loading, logout, isAuthorized } = useAuth();
  const [spendingEntries, setSpendingEntries] = useState<SpendingEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manual' | 'voice'>('voice');

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
              <div className="text-2xl sm:text-3xl mr-3">💰</div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              </div>

              {/* Tab Content */}
              {activeTab === 'voice' ? (
                <VoiceSpending onSpendingDetected={handleAddSpending} />
              ) : (
                <SpendingForm onSubmit={handleAddSpending} />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Recent Expenses
              </h2>
              {dataLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <SpendingList entries={spendingEntries} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
