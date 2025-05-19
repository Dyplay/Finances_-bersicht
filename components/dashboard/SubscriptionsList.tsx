'use client';

import { useState } from 'react';
import { Subscription } from '@/lib/types';
import { formatDate, getDaysUntilBilling } from '@/lib/utils/date-utils';
import { formatCurrency } from '@/lib/utils/finance-utils';
import { TRANSACTION_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Trash2, ExternalLink, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SubscriptionForm from '@/components/subscriptions/SubscriptionForm';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface SubscriptionsListProps {
  subscriptions: Subscription[];
  limit?: number;
  className?: string;
}

export default function SubscriptionsList({
  subscriptions,
  limit,
  className,
}: SubscriptionsListProps) {
  const { updateSubscription, deleteSubscription } = useSubscriptions();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const displaySubscriptions = limit 
    ? subscriptions.slice(0, limit) 
    : subscriptions;
  
  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id);
    }
  };
  
  const handleUpdate = async (data: any) => {
    if (selectedSubscription) {
      await updateSubscription(selectedSubscription.id, data);
      setIsDialogOpen(false);
      setSelectedSubscription(null);
    }
  };
  
  const getCategoryColor = (categoryId: string) => {
    const category = TRANSACTION_CATEGORIES.find(c => c.id === categoryId);
    return category?.color || '#94A3B8';
  };
  
  const getBillingLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'biannual': return 'Biannual';
      case 'annual': return 'Annual';
      default: return cycle;
    }
  };
  
  const getRenewalStatus = (daysLeft: number) => {
    if (daysLeft <= 3) return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
    if (daysLeft <= 7) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
  };
  
  // Render empty state if no data
  if (displaySubscriptions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">No active subscriptions</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Active Subscriptions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {displaySubscriptions.map((subscription) => {
            const daysUntilBilling = getDaysUntilBilling(subscription.nextBillingDate);
            const renewalStatusClass = getRenewalStatus(daysUntilBilling);
            
            return (
              <div 
                key={subscription.id}
                className="flex items-center justify-between p-4 border-b last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getCategoryColor(subscription.category) }}
                  >
                    <span className="text-white font-medium">{subscription.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{subscription.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <span>{formatCurrency(subscription.amount)}</span>
                      <span>•</span>
                      <span>{getBillingLabel(subscription.billingCycle)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
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
                  
                  <div className="flex space-x-1">
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
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <SubscriptionForm
              onSubmit={handleUpdate}
              initialData={selectedSubscription}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}