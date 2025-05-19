'use client';

import { useState, useEffect } from 'react';
import { ID, Query } from 'appwrite';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/hooks/useAuth';
import { Subscription, CreateSubscriptionDTO } from '@/lib/types';
import { DATABASES, COLLECTIONS } from '@/lib/constants';
import { getNextBillingDate } from '@/lib/utils/date-utils';

export function useSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch all subscriptions for the current user
  const fetchSubscriptions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await databases.listDocuments(
        DATABASES.FINANCE,
        COLLECTIONS.SUBSCRIPTIONS,
        [
          Query.equal('userId', user.userId),
          Query.orderDesc('nextBillingDate')
        ]
      );
      
      // Map to Subscription type
      const mappedSubscriptions = response.documents.map(doc => ({
        id: doc.$id,
        userId: doc.userId,
        name: doc.name,
        amount: doc.amount,
        billingCycle: doc.billingCycle,
        category: doc.category,
        startDate: doc.startDate,
        nextBillingDate: doc.nextBillingDate,
        notes: doc.notes,
        website: doc.website,
        isActive: doc.isActive,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      })) as Subscription[];
      
      setSubscriptions(mappedSubscriptions);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      setError(error.message || 'Failed to fetch subscriptions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new subscription
  const createSubscription = async (data: CreateSubscriptionDTO) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await databases.createDocument(
        DATABASES.FINANCE,
        COLLECTIONS.SUBSCRIPTIONS,
        ID.unique(),
        {
          userId: user.userId,
          ...data
        }
      );
      
      const newSubscription: Subscription = {
        id: response.$id,
        userId: response.userId,
        name: response.name,
        amount: response.amount,
        billingCycle: response.billingCycle,
        category: response.category,
        startDate: response.startDate,
        nextBillingDate: response.nextBillingDate,
        notes: response.notes,
        website: response.website,
        isActive: response.isActive,
        createdAt: response.$createdAt,
        updatedAt: response.$updatedAt
      };
      
      setSubscriptions(prev => [newSubscription, ...prev]);
      return newSubscription;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      setError(error.message || 'Failed to create subscription');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an existing subscription
  const updateSubscription = async (id: string, data: Partial<CreateSubscriptionDTO>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await databases.updateDocument(
        DATABASES.FINANCE,
        COLLECTIONS.SUBSCRIPTIONS,
        id,
        data
      );
      
      const updatedSubscription: Subscription = {
        id: response.$id,
        userId: response.userId,
        name: response.name,
        amount: response.amount,
        billingCycle: response.billingCycle,
        category: response.category,
        startDate: response.startDate,
        nextBillingDate: response.nextBillingDate,
        notes: response.notes,
        website: response.website,
        isActive: response.isActive,
        createdAt: response.$createdAt,
        updatedAt: response.$updatedAt
      };
      
      setSubscriptions(prev => 
        prev.map(s => (s.id === id ? updatedSubscription : s))
      );
      
      return updatedSubscription;
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      setError(error.message || 'Failed to update subscription');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a subscription
  const deleteSubscription = async (id: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await databases.deleteDocument(
        DATABASES.FINANCE,
        COLLECTIONS.SUBSCRIPTIONS,
        id
      );
      
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      setError(error.message || 'Failed to delete subscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process next billing for a subscription
  const processNextBilling = async (id: string) => {
    if (!user) return null;
    
    const subscription = subscriptions.find(s => s.id === id);
    if (!subscription) return null;
    
    try {
      const nextBillingDate = getNextBillingDate(
        subscription.nextBillingDate,
        subscription.billingCycle
      );
      
      return await updateSubscription(id, { nextBillingDate });
    } catch (error: any) {
      console.error('Error processing next billing:', error);
      setError(error.message || 'Failed to process next billing');
      return null;
    }
  };
  
  // Calculate monthly subscription cost
  const calculateMonthlyCost = (): number => {
    return subscriptions
      .filter(sub => sub.isActive)
      .reduce((total, sub) => {
        let monthlyCost = 0;
        
        switch (sub.billingCycle) {
          case 'monthly':
            monthlyCost = sub.amount;
            break;
          case 'quarterly':
            monthlyCost = sub.amount / 3;
            break;
          case 'biannual':
            monthlyCost = sub.amount / 6;
            break;
          case 'annual':
            monthlyCost = sub.amount / 12;
            break;
        }
        
        return total + monthlyCost;
      }, 0);
  };
  
  // Get upcoming renewals (next 14 days)
  const getUpcomingRenewals = (): Subscription[] => {
    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);
    
    return subscriptions
      .filter(sub => {
        if (!sub.isActive) return false;
        
        const nextBillingDate = new Date(sub.nextBillingDate);
        return nextBillingDate >= today && nextBillingDate <= twoWeeksLater;
      })
      .sort((a, b) => {
        return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
      });
  };

  // Fetch subscriptions on mount or when user changes
  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else {
      setSubscriptions([]);
    }
  }, [user]);
  
  return {
    subscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    processNextBilling,
    calculateMonthlyCost,
    getUpcomingRenewals
  };
}