'use client';

import { useState, useRef, useEffect } from 'react';

interface VoiceButtonProps {
  onSpeechResult: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export default function VoiceButton({ onSpeechResult, onError, disabled = false }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentFinalTranscriptRef = useRef<string>('');

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    // Initialize speech recognition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    if (!recognition) return;
    
    // Enable continuous listening for longer sentences
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Can be changed to 'ja-JP' for Japanese
    
    // Increase the maximum time to listen (in milliseconds)
    // Note: This is browser-dependent, but we'll handle it with our own timeout

    recognition.onstart = () => {
      setIsListening(true);
      setState('listening');
      setTranscript('');
      currentFinalTranscriptRef.current = '';
      console.log('🎤 Started listening...');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log('🎤 Speech result received:', event.results.length, 'results');
      let interimTranscript = '';
      let currentFinalTranscript = currentFinalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        console.log(`🎤 Result ${i}: "${transcript}" (final: ${isFinal})`);
        
        if (isFinal) {
          currentFinalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update both state and ref
      const fullTranscript = currentFinalTranscript + interimTranscript;
      setTranscript(fullTranscript);
      currentFinalTranscriptRef.current = currentFinalTranscript;

      console.log('🎤 Current transcript:', fullTranscript);

      // Reset the pause timeout whenever we get new results
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }

      // Set a timeout to stop listening after a pause (2 seconds)
      pauseTimeoutRef.current = setTimeout(() => {
        if (isListening) {
          console.log('⏸️ Pause detected, stopping...');
          recognition.stop();
        }
      }, 2000);
    };

    recognition.onend = () => {
      console.log('🎤 Recognition ended');
      setIsListening(false);
      
      // Clear any pending pause timeout
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }

      // Use ref value instead of state to get the current final transcript
      const trimmedTranscript = currentFinalTranscriptRef.current.trim();
      console.log('🎤 Final transcript to process:', trimmedTranscript);
      
      if (trimmedTranscript.length > 0) {
        setState('processing');
        console.log('✅ Final transcript:', trimmedTranscript);
        onSpeechResult(trimmedTranscript);
        setState('success');
        setTimeout(() => setState('idle'), 2000);
      } else {
        setState('idle');
        console.log('❌ No speech detected');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('🎤 Speech recognition error:', event.error, event.message);
      setIsListening(false);
      setState('error');
      
      // Clear any pending pause timeout
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }

      const errorMessage = getErrorMessage(event.error);
      onError?.(errorMessage);
      setTimeout(() => setState('idle'), 3000);
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [onSpeechResult, onError]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'Microphone not found. Please check your microphone.';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access.';
      case 'network':
        return 'Network error. Please check your connection.';
      default:
        return 'Speech recognition error. Please try again.';
    }
  };

  const handleClick = async () => {
    if (disabled || !recognitionRef.current) return;

    if (isListening) {
      // Stop listening immediately
      recognitionRef.current.stop();
    } else {
      // Check microphone permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        
        // Start listening
        recognitionRef.current.start();
      } catch (error) {
        console.error('🎤 Microphone permission error:', error);
        setState('error');
        onError?.('Microphone access denied. Please allow microphone access and try again.');
        setTimeout(() => setState('idle'), 3000);
      }
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300';
    
    switch (state) {
      case 'listening':
        return `${baseClasses} bg-red-500 hover:bg-red-600 text-white animate-pulse`;
      case 'processing':
        return `${baseClasses} bg-yellow-500 text-white`;
      case 'success':
        return `${baseClasses} bg-green-500 text-white`;
      case 'error':
        return `${baseClasses} bg-red-600 text-white`;
      default:
        return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'listening':
        return (
          <div className="relative">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            <div className="absolute inset-0 animate-ping bg-red-400 rounded-full opacity-75"></div>
          </div>
        );
      case 'processing':
        return (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'success':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getTooltipText = () => {
    switch (state) {
      case 'listening':
        return 'Listening... Click to stop or wait for pause';
      case 'processing':
        return 'Processing your speech...';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error occurred';
      default:
        return 'Click to start voice input';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={getButtonClasses()}
        title={getTooltipText()}
        aria-label={getTooltipText()}
      >
        {getIcon()}
      </button>
      
      {transcript && (
        <div className="text-sm text-gray-600 max-w-xs text-center">
          <div className="font-medium mb-1">🎤 You said:</div>
          <div className="bg-gray-100 p-2 rounded text-xs">
            {transcript}
          </div>
          {isListening && (
            <div className="text-xs text-blue-600 mt-1">
              Keep speaking... (will stop after 2s pause)
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        {state === 'listening' && 'Speak now... (click to stop)'}
        {state === 'processing' && 'Processing...'}
        {state === 'success' && 'Success!'}
        {state === 'error' && 'Error occurred'}
      </div>
    </div>
  );
} 