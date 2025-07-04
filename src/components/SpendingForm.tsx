'use client';

import { useState } from 'react';
import { SpendingCategory, SPENDING_CATEGORIES, UserType, USER_OPTIONS, CurrencyType, CURRENCY_OPTIONS } from '@/types/spending';

interface SpendingFormProps {
  onSubmit: (entry: { amount: number; category: SpendingCategory; description: string; date: string; user: UserType; currency: CurrencyType }) => void;
}

export default function SpendingForm({ onSubmit }: SpendingFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<SpendingCategory>('groceries');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [user, setUser] = useState<UserType>('sharing');
  const [currency, setCurrency] = useState<CurrencyType>('JPY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        amount: numAmount,
        category,
        description: description.trim(),
        date,
        user,
        currency,
      });
      
      // Reset form
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setUser('sharing');
      setCurrency('JPY');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        >
          {CURRENCY_OPTIONS.map((curr) => (
            <option key={curr.value} value={curr.value}>
              {curr.emoji} {curr.symbol} {curr.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as SpendingCategory)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        >
          {SPENDING_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.emoji} {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
          User
        </label>
        <select
          id="user"
          value={user}
          onChange={(e) => setUser(e.target.value as UserType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        >
          {USER_OPTIONS.map((userOption) => (
            <option key={userOption.value} value={userOption.value}>
              {userOption.emoji} {userOption.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          placeholder="What did you spend money on?"
          required
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
} 