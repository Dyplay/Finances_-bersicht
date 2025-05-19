import { Models } from 'appwrite';

// Authentication types
export interface UserSession {
  userId: string;
  name: string | null;
  email: string;
  isLoggedIn: boolean;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'expense' | 'income';
  description: string;
  category: string;
  date: string; // ISO date string
  isRecurring: boolean;
  recurringId?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDTO {
  amount: number;
  type: 'expense' | 'income';
  description: string;
  category: string;
  date: string;
  isRecurring: boolean;
  recurringId?: string;
  notes?: string;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  category: string;
  startDate: string;
  nextBillingDate: string;
  notes?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDTO {
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  category: string;
  startDate: string;
  nextBillingDate: string;
  notes?: string;
  website?: string;
  isActive: boolean;
}

// Category types
export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Budget types
export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  categories: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard and reports types
export interface FinancialOverview {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  savingsRate: number;
  subscriptionsTotal: number;
  period: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

// Filter/search types
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  type?: 'expense' | 'income' | 'all';
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: 'date' | 'amount' | 'category';
  sortDirection?: 'asc' | 'desc';
}