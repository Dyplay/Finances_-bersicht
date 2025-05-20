// Database and Collection IDs
export const DATABASES = {
  FINANCE: '682b27fa001114d6f6a4',
};

export const COLLECTIONS = {
  TRANSACTIONS: '682b282800119161d0ad',
  SUBSCRIPTIONS: '682b281500291d3decef',
  CATEGORIES: '682b281e000887f475c4',
  BUDGETS: 'budgets',
};

// Transaction categories
export const TRANSACTION_CATEGORIES = [
  { id: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#4ADE80' },
  { id: 'dining', name: 'Dining Out', icon: 'utensils', color: '#FB7185' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#60A5FA' },
  { id: 'utilities', name: 'Utilities', icon: 'lightbulb', color: '#FBBF24' },
  { id: 'transportation', name: 'Transportation', icon: 'car', color: '#A78BFA' },
  { id: 'housing', name: 'Housing', icon: 'home', color: '#F472B6' },
  { id: 'healthcare', name: 'Healthcare', icon: 'heart-pulse', color: '#34D399' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#F87171' },
  { id: 'education', name: 'Education', icon: 'graduation-cap', color: '#818CF8' },
  { id: 'personal', name: 'Personal', icon: 'user', color: '#6EE7B7' },
  { id: 'travel', name: 'Travel', icon: 'plane', color: '#FCD34D' },
  { id: 'income', name: 'Income', icon: 'wallet', color: '#2DD4BF' },
  { id: 'other', name: 'Other', icon: 'circle-dot', color: '#94A3B8' },
];

// Navigation links
export const NAV_LINKS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'layout-dashboard' },
  { name: 'Transactions', href: '/transactions', icon: 'receipt' },
  { name: 'Subscriptions', href: '/subscriptions', icon: 'repeat' },
  { name: 'Budgets', href: '/budgets', icon: 'piggy-bank' },
  { name: 'Reports', href: '/reports', icon: 'bar-chart-2' },
  { name: 'Settings', href: '/settings', icon: 'settings' },
];

// Time periods for filtering
export const TIME_PERIODS = [
  { id: 'day', name: 'Today' },
  { id: 'week', name: 'This Week' },
  { id: 'month', name: 'This Month' },
  { id: 'quarter', name: 'This Quarter' },
  { id: 'year', name: 'This Year' },
  { id: 'all', name: 'All Time' },
  { id: 'custom', name: 'Custom Range' },
];