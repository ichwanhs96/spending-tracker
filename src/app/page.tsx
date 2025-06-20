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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with user info and logout */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              💰 Spending Tracker
            </h1>
            <p className="text-lg text-gray-600">
              Track your expenses and manage your budget
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome,</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Add New Expense
            </h2>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('voice')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'voice'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎤 Voice Input
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
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

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
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
  );
}
