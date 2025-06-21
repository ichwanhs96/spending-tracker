import { NextRequest, NextResponse } from 'next/server';
import natural from 'natural';
import nlp from 'compromise';
import 'compromise-numbers';
import 'compromise-dates';

// Extend compromise with additional plugins
// Plugins are imported above and automatically extend nlp

interface ParsedSpending {
  amount: number;
  currency: string;
  category: string;
  description: string;
  location: string;
  date: string;
  confidence: number;
  timestamp: string;
}

interface ExtractedEntities {
  amounts: string[];
  currencies: string[];
  places: string[];
  dates: string[];
  organizations: string[];
  money: string[];
}

// Initialize classifier (singleton pattern for Vercel optimization)
let classifier: natural.BayesClassifier | null = null;

const getClassifier = (): natural.BayesClassifier => {
  if (!classifier) {
    classifier = new natural.BayesClassifier();
    
    // Train the classifier with category keywords
    // Dining/Food
    classifier.addDocument('coffee latte matcha drink beverage tea', 'dining');
    classifier.addDocument('restaurant cafe lunch dinner breakfast meal', 'dining');
    classifier.addDocument('pizza burger sandwich sushi ramen', 'dining');
    classifier.addDocument('starbucks doutor coffee shop cafe', 'dining');
    
    // Coffee (new category)
    classifier.addDocument('coffee latte espresso cappuccino americano', 'coffee');
    classifier.addDocument('starbucks doutor tullys coffee shop cafe', 'coffee');
    classifier.addDocument('coffee bean coffee time coffee break', 'coffee');
    classifier.addDocument('iced coffee hot coffee coffee drink', 'coffee');
    
    // Groceries
    classifier.addDocument('grocery food supermarket market store', 'groceries');
    classifier.addDocument('vegetables fruits meat bread milk', 'groceries');
    classifier.addDocument('walmart costco target grocery store', 'groceries');
    
    // Transportation
    classifier.addDocument('transport bus train taxi uber lyft', 'transportation');
    classifier.addDocument('gasoline fuel parking toll subway', 'transportation');
    classifier.addDocument('car bike scooter metro station', 'transportation');
    
    // Shopping
    classifier.addDocument('bought purchase shop mall store', 'shopping');
    classifier.addDocument('clothes shoes bag accessories', 'shopping');
    classifier.addDocument('amazon ebay online shopping', 'shopping');
    
    // Entertainment
    classifier.addDocument('movie theater concert game entertainment', 'entertainment');
    classifier.addDocument('netflix spotify youtube subscription', 'entertainment');
    classifier.addDocument('ticket show performance event', 'entertainment');
    
    // Utilities
    classifier.addDocument('electricity water gas internet phone', 'utilities');
    classifier.addDocument('bill payment utility service', 'utilities');
    
    // Health
    classifier.addDocument('medicine pharmacy doctor hospital', 'health');
    classifier.addDocument('vitamin supplement health care', 'health');
    
    // Education
    classifier.addDocument('book course class education study', 'education');
    classifier.addDocument('school university college tuition', 'education');
    
    // Hobby
    classifier.addDocument('hobby craft art music instrument', 'hobby');
    classifier.addDocument('gym fitness workout exercise', 'hobby');
    
    classifier.train();
  }
  return classifier;
};

// Extract entities from text using Compromise.js
const extractEntities = (text: string): ExtractedEntities => {
  const doc = nlp(text.toLowerCase());
  
  // Use any type to avoid TypeScript issues with compromise plugins
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docAny = doc as any;
  
  return {
    amounts: docAny.numbers ? docAny.numbers().out('array') : [],
    currencies: docAny.currencies ? docAny.currencies().out('array') : [],
    places: docAny.places ? docAny.places().out('array') : [],
    dates: docAny.dates ? docAny.dates().out('array') : [],
    organizations: docAny.organizations ? docAny.organizations().out('array') : [],
    money: docAny.money ? docAny.money().out('array') : []
  };
};

// Generate description from extracted entities
// eslint-disable-next-line
const generateDescription = (entities: ExtractedEntities, originalText: string): string => {
  // const words = originalText.toLowerCase().split(' ');
  
  // // Look for spending-related keywords
  // const spendingKeywords = ['bought', 'purchased', 'spent', 'paid', 'got', 'bought', 'purchase'];
  // const keywordIndex = words.findIndex(word => spendingKeywords.includes(word));
  
  // if (keywordIndex !== -1 && keywordIndex < words.length - 1) {
  //   // Extract words after the spending keyword
  //   let descriptionWords = words.slice(keywordIndex + 1);
    
  //   // Remove amount and currency words
  //   const amountWords = entities.amounts.flatMap(amount => amount.split(' '));
  //   const currencyWords = entities.currencies.flatMap(currency => currency.split(' '));
  //   const moneyWords = entities.money.flatMap(money => money.split(' '));
    
  //   // Filter out amounts, currencies, and common prepositions
  //   const filterWords = [...amountWords, ...currencyWords, ...moneyWords, 'on', 'for', 'at', 'in', 'with'];
  //   descriptionWords = descriptionWords.filter(word => 
  //     !filterWords.includes(word) && 
  //     !word.match(/^\d+$/) && // Remove pure numbers
  //     !word.match(/^(yen|dollars?|usd|¥|\$)$/i) // Remove currency words
  //   );
    
  //   // If we still have words, return them
  //   if (descriptionWords.length > 0) {
  //     return descriptionWords.join(' ').trim();
  //   }
  // }
  
  // // Fallback: use organizations or places
  // if (entities.organizations.length > 0) {
  //   return entities.organizations[0];
  // }
  
  // if (entities.places.length > 0) {
  //   return entities.places[0];
  // }
  
  return originalText;
};

// Categorize spending based on text content
const categorizeSpending = (text: string, description: string): string => {
  const classifier = getClassifier();
  const combinedText = `${text} ${description}`.toLowerCase();
  
  const category = classifier.classify(combinedText);
  const confidence = classifier.getClassifications(combinedText)[0]?.value || 0;
  
  // If confidence is too low, default to 'other'
  if (confidence < 0.3) {
    return 'other';
  }
  
  return category;
};

// Parse currency and amount from money strings
const parseMoney = (moneyStrings: string[], amounts: string[] = []): { amount: number; currency: string } => {
  let amount = 0;
  let currency = 'USD';
  
  // Try to parse from money strings first
  if (moneyStrings.length > 0) {
    const moneyStr = moneyStrings[0];
    
    // Extract amount (numbers) - updated regex to handle comma-separated numbers
    // This regex captures digits with optional commas and decimal places
    const amountMatch = moneyStr.match(/([\d,]+(?:\.\d{2})?)/);
    if (amountMatch) {
      // Remove commas and parse as float
      const cleanAmount = amountMatch[1].replace(/,/g, '');
      amount = parseFloat(cleanAmount);
    }
    
    // Extract currency
    const currencyMatch = moneyStr.match(/(yen|dollars?|usd|¥|\$)/i);
    if (currencyMatch) {
      const currencyStr = currencyMatch[1].toLowerCase();
      if (currencyStr === 'yen' || currencyStr === '¥') {
        currency = 'JPY';
      } else if (currencyStr === 'dollars' || currencyStr === 'dollar' || currencyStr === 'usd' || currencyStr === '$') {
        currency = 'USD';
      }
    }
  }
  
  // Fallback: if no amount found in money strings, try amounts array
  if (amount <= 0 && amounts.length > 0) {
    const amountStr = amounts[0];
    // Remove commas and parse as float
    const cleanAmount = amountStr.replace(/,/g, '');
    amount = parseFloat(cleanAmount);
  }
  
  return { amount, currency };
};

// Calculate confidence score
const calculateConfidence = (entities: ExtractedEntities, amount: number, description: string): number => {
  let confidence = 0;
  
  // Amount found
  if (amount > 0) confidence += 0.4;
  
  // Description generated
  if (description && description !== 'Voice expense') confidence += 0.3;
  
  // Location found
  if (entities.places.length > 0 || entities.organizations.length > 0) confidence += 0.2;
  
  // Date found (explicitly mentioned)
  if (entities.dates.length > 0) confidence += 0.1;
  
  return Math.min(confidence, 1);
};

// Helper to resolve relative date phrases to ISO date string
// eslint-disable-next-line
const resolveDate = (text: string, entities: ExtractedEntities): string => {
  const doc = nlp(text.toLowerCase());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dateJsons = (doc as any).dates ? (doc as any).dates().json() : [];
  if (dateJsons.length > 0 && dateJsons[0].date) {
    // Compromise gives a JS Date object in .date
    const d = dateJsons[0].date;
    if (d instanceof Date && !isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  }
  // Fallback to today
  return new Date().toISOString().split('T')[0];
};

// Main parsing function
const parseVoiceSpending = (text: string): ParsedSpending => {
  const entities = extractEntities(text);
  const { amount, currency } = parseMoney(entities.money, entities.amounts);
  const description = generateDescription(entities, text);
  const category = categorizeSpending(text, description);
  
  // Get location (prioritize places, then organizations)
  const location = entities.places[0] || entities.organizations[0] || '';
  
  // Get date (resolve relative phrases to ISO date)
  const now = new Date();
  const timestamp = now.toISOString(); // Full ISO timestamp
  const date = resolveDate(text, entities);
  
  // Calculate confidence based on extracted data
  const confidence = calculateConfidence(entities, amount, description);
  
  return {
    amount,
    currency,
    category,
    description,
    location,
    date,
    confidence,
    timestamp
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }

    console.log('🎤 Processing voice input:', text);
    
    // Parse the voice input
    const parsed = parseVoiceSpending(text);
    
    console.log('📊 Parsed result:', parsed);
    
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error processing voice input:', error);
    return NextResponse.json(
      { error: 'Failed to process voice input' },
      { status: 500 }
    );
  }
} 