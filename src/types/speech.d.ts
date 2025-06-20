// Web Speech API TypeScript definitions
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare let SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare let webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof webkitSpeechRecognition;
} 