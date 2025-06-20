'use client';

import { useState } from 'react';
import { SPENDING_CATEGORIES } from '@/types/spending';

interface ParsedSpending {
  amount: number;
  currency: string;
  category: string;
  description: string;
  location: string;
  date: string;
  confidence: number;
}

interface VoiceConfirmationProps {
  parsedSpending: ParsedSpending;
  onConfirm: (spending: Omit<ParsedSpending, 'confidence'>) => void;
  onCancel: () => void;
  onEdit: (field: keyof ParsedSpending, value: string | number) => void;
}

export default function VoiceConfirmation({ 
  parsedSpending, 
  onConfirm, 
  onCancel, 
  onEdit 
}: VoiceConfirmationProps) {
  const [isEditing, setIsEditing] = useState(false);

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'JPY' ? 'JPY' : 'USD',
    });
    return formatter.format(amount);
  };

  const getCategoryInfo = (category: string) => {
    return SPENDING_CATEGORIES.find(cat => cat.value === category) || 
           { emoji: '📝', label: 'Other' };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  const handleConfirm = () => {
    const { ...spendingData } = parsedSpending;
    onConfirm(spendingData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🎤 Voice Expense Detected
        </h3>
        <div className={`text-sm font-medium ${getConfidenceColor(parsedSpending.confidence)}`}>
          {getConfidenceText(parsedSpending.confidence)}
        </div>
      </div>

      <div className="space-y-4">
        {/* Amount and Currency */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            {isEditing ? (
              <input
                type="number"
                value={parsedSpending.amount}
                onChange={(e) => onEdit('amount', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                step="0.01"
                min="0"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formatAmount(parsedSpending.amount, parsedSpending.currency)}
              </div>
            )}
          </div>
          {isEditing && (
            <div className="ml-4">
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={parsedSpending.currency}
                onChange={(e) => onEdit('currency', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="USD">USD ($)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            {isEditing ? (
              <select
                value={parsedSpending.category}
                onChange={(e) => onEdit('category', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                {SPENDING_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center mt-1">
                <span className="text-2xl mr-2">
                  {getCategoryInfo(parsedSpending.category).emoji}
                </span>
                <span className="text-lg font-medium text-gray-900">
                  {getCategoryInfo(parsedSpending.category).label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          {isEditing ? (
            <input
              type="text"
              value={parsedSpending.description}
              onChange={(e) => onEdit('description', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          ) : (
            <div className="mt-1 text-lg text-gray-900">
              {parsedSpending.description}
            </div>
          )}
        </div>

        {/* Location */}
        {parsedSpending.location && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            {isEditing ? (
              <input
                type="text"
                value={parsedSpending.location}
                onChange={(e) => onEdit('location', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            ) : (
              <div className="mt-1 text-lg text-gray-900">
                📍 {parsedSpending.location}
              </div>
            )}
          </div>
        )}

        {/* Date */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700">Date</label>
          {isEditing ? (
            <input
              type="date"
              value={parsedSpending.date}
              onChange={(e) => onEdit('date', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          ) : (
            <div className="mt-1 text-lg text-gray-900">
              📅 {new Date(parsedSpending.date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-6">
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Confirm
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel Edit
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Save
            </button>
          </>
        )}
      </div>

      <button
        onClick={onCancel}
        className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm focus:outline-none"
      >
        Cancel
      </button>
    </div>
  );
} 