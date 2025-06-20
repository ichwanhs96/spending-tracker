'use client';

import { useState, useEffect } from 'react';
import SpendingForm from '@/components/SpendingForm';
import SpendingList from '@/components/SpendingList';
import { SpendingEntry } from '@/types/spending';

export default function Home() {
  const [spendingEntries, setSpendingEntries] = useState<SpendingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpendingData();
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
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💰 Spending Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Track your expenses and manage your budget
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Add New Expense
            </h2>
            <SpendingForm onSubmit={handleAddSpending} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Recent Expenses
            </h2>
            {loading ? (
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
