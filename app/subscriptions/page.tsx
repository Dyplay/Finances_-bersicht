'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { TRANSACTION_CATEGORIES } from '@/lib/constants';
import { formatDate, getDaysUntilBilling } from '@/lib/utils/date-utils';
import { formatCurrency } from '@/lib/utils/finance-utils';
import { cn } from '@/lib/utils';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { 
    subscriptions, 
    isLoading: subscriptionsLoading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    calculateMonthlyCost,
  } = useSubscriptions();
  
  const [isNewSubscriptionOpen, setIsNewSubscriptionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Filtered subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate total costs
  const monthlyCost = calculateMonthlyCost();
  const annualCost = monthlyCost * 12;
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  
  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Handle new subscription submission
  const handleNewSubscription = async (data: any) => {
    await createSubscription(data);
    setIsNewSubscriptionOpen(false);
  };
  
  // Handle edit subscription
  const handleEdit = (subscription: any) => {
    setSelectedSubscription(subscription);
    setIsEditDialogOpen(true);
  };
  
  // Handle update subscription
  const handleUpdate = async (data: any) => {
    if (selectedSubscription) {
      await updateSubscription(selectedSubscription.id, data);
      setIsEditDialogOpen(false);
      setSelectedSubscription(null);
    }
  };
  
  // Handle delete subscription
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id);
    }
  };
  
  // Get category color
  const getCategoryColor = (categoryId: string) => {
    const category = TRANSACTION_CATEGORIES.find(c => c.id === categoryId);
    return category?.color || '#94A3B8';
  };
  
  // Get billing cycle label
  const getBillingLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'biannual': return 'Biannual';
      case 'annual': return 'Annual';
      default: return cycle;
    }
  };
  
  // Get renewal status class
  const getRenewalStatus = (daysLeft: number) => {
    if (daysLeft <= 3) return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
    if (daysLeft <= 7) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
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
                <h1 className="text-2xl md:text-3xl font-bold">Subscriptions</h1>
                <p className="text-muted-foreground">
                  Manage your recurring subscriptions
                </p>
              </div>
              
              <Dialog open={isNewSubscriptionOpen} onOpenChange={setIsNewSubscriptionOpen}>
                <DialogTrigger asChild>
                  <Button>
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
            
            {/* Subscription overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Cost</CardTitle>
                  <CardDescription>Total subscription expenses per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatCurrency(monthlyCost)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Annual Cost</CardTitle>
                  <CardDescription>Projected yearly subscription expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatCurrency(annualCost)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Subscriptions</CardTitle>
                  <CardDescription>Number of ongoing subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{subscriptions.filter(s => s.isActive).length}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Subscriptions list */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Subscriptions</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search subscriptions..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Billing Cycle</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          {subscriptionsLoading ? (
                            <p>Loading subscriptions...</p>
                          ) : (
                            <p>No subscriptions found.</p>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscriptions.map((subscription) => {
                        const daysUntilBilling = getDaysUntilBilling(subscription.nextBillingDate);
                        const renewalStatusClass = getRenewalStatus(daysUntilBilling);
                        
                        return (
                          <TableRow key={subscription.id}>
                            <TableCell className="font-medium">{subscription.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: getCategoryColor(subscription.category) }}
                                />
                                {TRANSACTION_CATEGORIES.find(c => c.id === subscription.category)?.name || subscription.category}
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                            <TableCell>{getBillingLabel(subscription.billingCycle)}</TableCell>
                            <TableCell>{formatDate(subscription.nextBillingDate)}</TableCell>
                            <TableCell>
                              {subscription.isActive ? (
                                <Badge 
                                  variant="outline" 
                                  className={cn("flex items-center gap-1", renewalStatusClass)}
                                >
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {daysUntilBilling <= 0 
                                      ? 'Due today' 
                                      : `${daysUntilBilling} day${daysUntilBilling !== 1 ? 's' : ''}`}
                                  </span>
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-muted text-muted-foreground">
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                {subscription.website && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    asChild
                                  >
                                    <a href={subscription.website} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEdit(subscription)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDelete(subscription.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <SubscriptionForm
              onSubmit={handleUpdate}
              initialData={selectedSubscription}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}