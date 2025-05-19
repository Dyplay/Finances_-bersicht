import { Transaction, CategoryBreakdown, FinancialOverview, MonthlyTrend } from '../types';
import { TRANSACTION_CATEGORIES } from '../constants';

/**
 * Calculate the total amount for an array of transactions
 */
export function calculateTotal(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => {
    const amount = transaction.amount;
    return transaction.type === 'income' ? total + amount : total - amount;
  }, 0);
}

/**
 * Calculate income, expenses, and net amount for a period
 */
export function calculateFinancialOverview(
  transactions: Transaction[],
  subscriptionsTotal: number = 0
): FinancialOverview {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0) + subscriptionsTotal;
  const netAmount = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;
  
  return {
    totalIncome,
    totalExpenses,
    netAmount,
    savingsRate,
    subscriptionsTotal,
    period: 'current'
  };
}

/**
 * Calculate spending by category
 */
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Group expenses by category
  const categorySums = expenseTransactions.reduce((acc, transaction) => {
    const categoryId = transaction.category;
    if (!acc[categoryId]) {
      acc[categoryId] = 0;
    }
    acc[categoryId] += transaction.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Convert to array format
  return Object.entries(categorySums).map(([categoryId, amount]) => {
    const category = TRANSACTION_CATEGORIES.find(c => c.id === categoryId) || {
      id: categoryId,
      name: categoryId,
      color: '#94A3B8'
    };
    
    return {
      categoryId,
      categoryName: category.name,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: category.color
    };
  }).sort((a, b) => b.amount - a.amount);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, locale: string = 'en-US', currency: string = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(percentage: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(percentage / 100);
}

/**
 * Group transactions by month to show trends
 */
export function calculateMonthlyTrends(transactions: Transaction[]): MonthlyTrend[] {
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  
  // Initialize with last 6 months
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = { income: 0, expenses: 0 };
  }
  
  // Add transaction data
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }
    
    if (transaction.type === 'income') {
      monthlyData[monthKey].income += transaction.amount;
    } else {
      monthlyData[monthKey].expenses += transaction.amount;
    }
  });
  
  // Convert to array and calculate savings
  return Object.entries(monthlyData).map(([month, data]) => {
    const { income, expenses } = data;
    return {
      month,
      income,
      expenses,
      savings: income - expenses
    };
  }).sort((a, b) => a.month.localeCompare(b.month));
}