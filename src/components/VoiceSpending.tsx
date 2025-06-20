'use client';

import { useState } from 'react';
import VoiceButton from './VoiceButton';
import VoiceConfirmation from './VoiceConfirmation';
import { SpendingCategory } from '@/types/spending';

interface ParsedSpending {
  amount: number;
  currency: string;
  category: string;
  description: string;
  location: string;
  date: string;
  confidence: number;
}

interface VoiceSpendingProps {
  onSpendingDetected: (spending: { amount: number; category: SpendingCategory; description: string; date: string }) => void;
  disabled?: boolean;
}

export default function VoiceSpending({ onSpendingDetected, disabled = false }: VoiceSpendingProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [parsedSpending, setParsedSpending] = useState<ParsedSpending | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSpeechResult = async (text: string) => {
    try {
      console.log('🎤 Speech detected:', text);
      setIsProcessing(true);
      setError(null);
      
      // Call the server-side API for voice processing
      const response = await fetch('/api/voice-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to process voice input');
      }

      const parsed = await response.json();
      console.log('📊 Parsed result:', parsed);
      
      // Check if we got a valid amount
      if (parsed.amount <= 0) {
        setError('No amount detected. Please try again with a clear amount.');
        return;
      }
      
      setParsedSpending(parsed);
      setShowConfirmation(true);
    } catch (err) {
      console.error('Error parsing voice input:', err);
      setError('Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleConfirm = (spending: Omit<ParsedSpending, 'confidence'>) => {
    // Convert to the format expected by the parent component
    const spendingData = {
      amount: spending.amount,
      category: spending.category as SpendingCategory,
      description: spending.description,
      date: spending.date,
    };
    
    onSpendingDetected(spendingData);
    setShowConfirmation(false);
    setParsedSpending(null);
    setError(null);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setParsedSpending(null);
    setError(null);
  };

  const handleEdit = (field: keyof ParsedSpending, value: string | number) => {
    if (!parsedSpending) return;
    
    setParsedSpending({
      ...parsedSpending,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Voice Button */}
      <div className="flex justify-center">
        <VoiceButton
          onSpeechResult={handleSpeechResult}
          onError={handleVoiceError}
          disabled={disabled || isProcessing}
        />
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-700">Processing your voice input...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && parsedSpending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <VoiceConfirmation
              parsedSpending={parsedSpending}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onEdit={handleEdit}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        <p className="mb-2">💡 Try saying something like:</p>
        <div className="space-y-1 text-xs">
          <p>"I spent 680 yen on matcha latte at Doutor"</p>
          <p>"Bought groceries for 25 dollars at Walmart"</p>
          <p>"Paid 15.50 for lunch yesterday"</p>
        </div>
        <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs">
          <p className="font-medium text-blue-800">🎤 Voice Tips:</p>
          <ul className="text-blue-700 mt-1 space-y-1">
            <li>• Speak naturally - the system will wait for you to finish</li>
            <li>• Include the amount, what you bought, and where</li>
            <li>• Today's date is used by default (or say "yesterday", "last week", etc.)</li>
            <li>• Click the button again to stop early</li>
            <li>• It will automatically stop after 2 seconds of silence</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 