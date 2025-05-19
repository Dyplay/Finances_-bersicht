'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import OverviewCard from '@/components/dashboard/OverviewCard';
import TransactionsTable from '@/components/dashboard/TransactionsTable';
import ExpenseCategoryChart from '@/components/dashboard/ExpenseCategoryChart';
import SpendingTrendChart from '@/components/dashboard/SpendingTrendChart';
import SubscriptionsList from '@/components/dashboard/SubscriptionsList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TransactionForm from '@/components/transactions/TransactionForm';
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm';
import { Plus, BarChart4, PieChart, LineChart, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { calculateFinancialOverview } from '@/lib/utils/finance-utils';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { 
    transactions, 
    isLoading: transactionsLoading,
    createTransaction,
  } = useTransactions();
  const { 
    subscriptions, 
    isLoading: subscriptionsLoading,
    calculateMonthlyCost,
    getUpcomingRenewals,
    createSubscription,
  } = useSubscriptions();
  
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isNewSubscriptionOpen, setIsNewSubscriptionOpen] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  
  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Calculate financial overview
  const monthlyCost = calculateMonthlyCost();
  const financialOverview = calculateFinancialOverview(transactions, monthlyCost);
  const upcomingRenewals = getUpcomingRenewals();
  
  // Handle new transaction submission
  const handleNewTransaction = async (data: any) => {
    await createTransaction(data);
    setIsNewTransactionOpen(false);
  };
  
  // Handle new subscription submission
  const handleNewSubscription = async (data: any) => {
    await createSubscription(data);
    setIsNewSubscriptionOpen(false);
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
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user.name || 'User'}
                </p>
              </div>
              
              <div className="flex space-x-2">
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
                
                <Dialog open={isNewSubscriptionOpen} onOpenChange={setIsNewSubscriptionOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Subscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Subscription</DialogTitle>
                    </DialogHeader>
                    <SubscriptionForm 
                      onSubmit={handleNewSubscription}
                      onCancel={() => setIsNewSubscriptionOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <OverviewCard 
                title="Total Balance" 
                value={financialOverview.netAmount}
                icon={<DollarSign className="h-4 w-4" />}
                type={financialOverview.netAmount >= 0 ? 'income' : 'expense'}
              />
              <OverviewCard 
                title="Income" 
                value={financialOverview.totalIncome}
                type="income"
                trend={15.3}
              />
              <OverviewCard 
                title="Expenses" 
                value={financialOverview.totalExpenses}
                type="expense"
                trend={-7.2}
              />
              <OverviewCard 
                title="Subscriptions" 
                value={monthlyCost}
                type="expense"
              />
            </div>
            
            {/* Charts and visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExpenseCategoryChart transactions={transactions} />
              <SpendingTrendChart transactions={transactions} />
            </div>
            
            {/* Recent transactions and subscriptions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest financial activity</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/transactions')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <TransactionsTable 
                    transactions={transactions}
                    limit={5}
                  />
                </CardContent>
              </Card>
              
              <SubscriptionsList 
                subscriptions={upcomingRenewals.length > 0 ? upcomingRenewals : subscriptions} 
                limit={5}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}