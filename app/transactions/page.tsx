'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import TransactionsTable from '@/components/dashboard/TransactionsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TRANSACTION_CATEGORIES, TIME_PERIODS } from '@/lib/constants';
import { Plus, Search, Download, FileDown, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionFilters } from '@/lib/types';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function TransactionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { 
    transactions, 
    isLoading: transactionsLoading,
    createTransaction,
    fetchTransactions,
  } = useTransactions();
  
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  
  // Apply filters when they change
  useEffect(() => {
    const applyFilters = async () => {
      setIsLoading(true);
      
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      // Set date range based on selected time period
      const today = new Date();
      switch (selectedTimePeriod) {
        case 'day':
          startDate = format(today, 'yyyy-MM-dd');
          endDate = format(today, 'yyyy-MM-dd');
          break;
        case 'week':
          startDate = format(subDays(today, 7), 'yyyy-MM-dd');
          endDate = format(today, 'yyyy-MM-dd');
          break;
        case 'month':
          startDate = format(startOfMonth(today), 'yyyy-MM-dd');
          endDate = format(endOfMonth(today), 'yyyy-MM-dd');
          break;
        case 'quarter':
          startDate = format(subMonths(today, 3), 'yyyy-MM-dd');
          endDate = format(today, 'yyyy-MM-dd');
          break;
        case 'year':
          startDate = format(subMonths(today, 12), 'yyyy-MM-dd');
          endDate = format(today, 'yyyy-MM-dd');
          break;
        case 'all':
          // No date filtering
          break;
      }
      
      // Build filters object
      const filters: TransactionFilters = {
        startDate,
        endDate,
        search: searchQuery || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        categories: selectedCategory ? [selectedCategory] : undefined,
        sortBy: 'date',
        sortDirection: 'desc',
      };
      
      await fetchTransactions(filters);
      setIsLoading(false);
    };
    
    applyFilters();
  }, [
    selectedTimePeriod, 
    searchQuery, 
    selectedType, 
    selectedCategory, 
    fetchTransactions
  ]);
  
  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Handle new transaction submission
  const handleNewTransaction = async (data: any) => {
    await createTransaction(data);
    setIsNewTransactionOpen(false);
  };
  
  // Handle export transactions
  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Notes'];
    const csvRows = [headers];
    
    // Add transaction data
    transactions.forEach(transaction => {
      const category = TRANSACTION_CATEGORIES.find(c => c.id === transaction.category)?.name || transaction.category;
      const row = [
        transaction.date,
        transaction.description,
        category,
        transaction.amount.toString(),
        transaction.type,
        transaction.notes || ''
      ];
      csvRows.push(row);
    });
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="md:ml-64">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="flex flex-col space-y-4 md:space-y-6">
            {/* Page title and actions */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
                <p className="text-muted-foreground">
                  Manage and track your financial transactions
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <FileDown className="h-4 w-4" />
                </Button>
                
                <Dialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Transaction</DialogTitle>
                    </DialogHeader>
                    <TransactionForm 
                      onSubmit={handleNewTransaction}
                      onCancel={() => setIsNewTransactionOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search transactions..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select
                    value={selectedType}
                    onValueChange={(value: 'all' | 'income' | 'expense') => setSelectedType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {TRANSACTION_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={selectedTimePeriod}
                    onValueChange={setSelectedTimePeriod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="This Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_PERIODS.filter(p => p.id !== 'custom').map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Transactions table */}
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center">Loading transactions...</div>
                ) : (
                  <TransactionsTable 
                    transactions={transactions}
                    showActions={true}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}