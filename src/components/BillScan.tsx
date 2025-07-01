'use client';

import { useState, useRef, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { SpendingEntry, SpendingCategory, SPENDING_CATEGORIES } from '@/types/spending';

interface BillScanProps {
  onSpendingDetected: (entry: Omit<SpendingEntry, 'id' | 'timestamp'>) => void;
}

export default function BillScan({ onSpendingDetected }: BillScanProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [extractedAmount, setExtractedAmount] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    category: 'dining' as SpendingCategory,
    amount: '',
    user: 'ichwanharyosembodo96@gmail.com' as const,
    currency: 'USD' as const
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const extractAmountFromText = useCallback((text: string): number | null => {
    // Common patterns for total amounts in receipts
    const patterns = [
      /total[\s:]*\$?(\d+\.?\d*)/i,
      /amount[\s:]*\$?(\d+\.?\d*)/i,
      /due[\s:]*\$?(\d+\.?\d*)/i,
      /balance[\s:]*\$?(\d+\.?\d*)/i,
      /grand[\s]*total[\s:]*\$?(\d+\.?\d*)/i,
      /\$(\d+\.?\d*)/g, // Any dollar amount
      /\¥(\d+\.?\d*)/g, // Any yen amount
      /(\d+\.?\d*)/g // Any number (fallback)
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        // Find the largest amount (likely the total)
        const amounts = matches.map(match => {
          const num = parseFloat(match.replace(/[^\d.]/g, ''));
          return isNaN(num) ? 0 : num;
        });
        
        const maxAmount = Math.max(...amounts);
        if (maxAmount > 0 && maxAmount < 10000) { // Reasonable range for a bill
          return maxAmount;
        }
      }
    }
    
    return null;
  }, []);

  const processImage = useCallback(async (imageFile: File) => {
    setIsScanning(true);
    setError(null);
    setScanProgress(0);
    setExtractedText('');
    setExtractedAmount(null);

    try {
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(imageFile);

      // Initialize Tesseract worker
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.round(m.progress * 100));
          }
        }
      });

      // Perform OCR
      const { data: { text } } = await worker.recognize(imageFile);
      setExtractedText(text);

      // Extract amount from text
      const amount = extractAmountFromText(text);
      setExtractedAmount(amount);

      if (amount) {
        setFormData(prev => ({
          ...prev,
          amount: amount.toString(),
          description: `Bill Scan - ${new Date().toLocaleDateString()}`
        }));
      }

      await worker.terminate();
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to process image. Please try again with a clearer image.');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  }, [extractAmountFromText]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      setError('Please select a valid image file.');
    }
  }, [processImage]);

  const handleCameraCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access denied. Please use file upload instead.');
    }
  }, []);

  const captureFromCamera = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            processImage(file);
          }
        }, 'image/jpeg');
      }
      
      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
    }
  }, [processImage]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    onSpendingDetected({
      description: formData.description,
      amount: amount,
      category: formData.category,
      user: formData.user,
      currency: formData.currency,
      date: new Date().toISOString()
    });

    // Reset form
    setFormData({
      description: '',
      category: 'dining',
      amount: '',
      user: 'ichwanharyosembodo96@gmail.com',
      currency: 'USD'
    });
    setSelectedImage(null);
    setExtractedText('');
    setExtractedAmount(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [formData, onSpendingDetected]);

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            📁 Upload Bill Image
          </button>
          <button
            type="button"
            onClick={handleCameraCapture}
            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            📷 Use Camera
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Camera Interface */}
      <div className="relative">
        <video
          ref={videoRef}
          className={`w-full max-w-md mx-auto rounded-lg ${isCameraActive ? 'block' : 'hidden'}`}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        {isCameraActive && (
          <button
            onClick={captureFromCamera}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            📸 Capture
          </button>
        )}
      </div>

      {/* Scanning Progress */}
      {isScanning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Scanning bill... {scanProgress}%
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Image Preview */}
      {selectedImage && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Bill Preview</h3>
          <img 
            src={selectedImage} 
            alt="Bill preview" 
            className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
          />
        </div>
      )}

      {/* Extracted Information */}
      {extractedText && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Extracted Information</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Detected Amount:</p>
            {extractedAmount ? (
              <p className="text-2xl font-bold text-green-600">${extractedAmount.toFixed(2)}</p>
            ) : (
              <p className="text-sm text-red-600">No amount detected</p>
            )}
            <details className="mt-3">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                View extracted text
              </summary>
              <pre className="mt-2 text-xs text-gray-700 bg-white p-3 rounded border overflow-auto max-h-32">
                {extractedText}
              </pre>
            </details>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter description"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as SpendingCategory }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SPENDING_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.emoji} {category.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
} 