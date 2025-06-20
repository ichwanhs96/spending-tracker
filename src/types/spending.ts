export interface SpendingEntry {
  id: string;
  amount: number;
  category: SpendingCategory;
  description: string;
  date: string;
  timestamp: string;
  user: UserType;
}

export type SpendingCategory = 
  | 'groceries'
  | 'hobby'
  | 'transportation'
  | 'entertainment'
  | 'utilities'
  | 'dining'
  | 'shopping'
  | 'health'
  | 'education'
  | 'other';

export type UserType = 
  | 'ichwanharyosembodo96@gmail.com'
  | 'enowulan1201@gmail.com'
  | 'sharing';

export const SPENDING_CATEGORIES: { value: SpendingCategory; label: string; emoji: string }[] = [
  { value: 'groceries', label: 'Groceries', emoji: '🛒' },
  { value: 'hobby', label: 'Hobby', emoji: '🎨' },
  { value: 'transportation', label: 'Transportation', emoji: '🚗' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'utilities', label: 'Utilities', emoji: '⚡' },
  { value: 'dining', label: 'Dining', emoji: '🍽️' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'health', label: 'Health', emoji: '🏥' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'other', label: 'Other', emoji: '📝' },
];

export const USER_OPTIONS: { value: UserType; label: string; emoji: string }[] = [
  { value: 'ichwanharyosembodo96@gmail.com', label: 'Ichwan', emoji: '👨‍💻' },
  { value: 'enowulan1201@gmail.com', label: 'Eno', emoji: '👩‍💼' },
  { value: 'sharing', label: 'Sharing', emoji: '🤝' },
]; 