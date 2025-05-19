'use client';

import { useState, useEffect } from 'react';
import { ID, Query } from 'appwrite';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/hooks/useAuth';
import { Transaction, CreateTransactionDTO, TransactionFilters } from '@/lib/types';
import { DATABASES, COLLECTIONS } from '@/lib/constants';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch all transactions for the current user
  const fetchTransactions = async (filters?: TransactionFilters) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query filters
      let queries = [Query.equal('userId', user.userId)];
      
      if (filters) {
        if (filters.startDate) {
          queries.push(Query.greaterThanEqual('date', filters.startDate));
        }
        
        if (filters.endDate) {
          queries.push(Query.lessThanEqual('date', filters.endDate));
        }
        
        if (filters.categories && filters.categories.length > 0) {
          queries.push(Query.equal('category', filters.categories));
        }
        
        if (filters.type && filters.type !== 'all') {
          queries.push(Query.equal('type', filters.type));
        }
        
        if (filters.minAmount !== undefined) {
          queries.push(Query.greaterThanEqual('amount', filters.minAmount));
        }
        
        if (filters.maxAmount !== undefined) {
          queries.push(Query.lessThanEqual('amount', filters.maxAmount));
        }
        
        if (filters.search) {
          queries.push(Query.search('description', filters.search));
        }
      }
      
      // Add sorting
      const sortField = (filters?.sortBy || 'date') as string;
      const sortDirection = filters?.sortDirection === 'asc' ? 'asc' : 'desc';
      
      // Fetch transactions
      const response = await databases.listDocuments(
        DATABASES.FINANCE,
        COLLECTIONS.TRANSACTIONS,
        queries
      );
      
      // Map response to Transaction type
      const mappedTransactions = response.documents.map(doc => ({
        id: doc.$id,
        userId: doc.userId,
        amount: doc.amount,
        type: doc.type,
        description: doc.description,
        category: doc.category,
        date: doc.date,
        isRecurring: doc.isRecurring,
        recurringId: doc.recurringId,
        notes: doc.notes,
        receiptUrl: doc.receiptUrl,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      })) as Transaction[];
      
      // Sort transactions
      const sortedTransactions = [...mappedTransactions].sort((a, b) => {
        if (sortField === 'date') {
          return sortDirection === 'asc' 
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortField === 'amount') {
          return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        } else if (sortField === 'category') {
          return sortDirection === 'asc'
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        return 0;
      });
      
      setTransactions(sortedTransactions);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setError(error.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new transaction
  const createTransaction = async (data: CreateTransactionDTO) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await databases.createDocument(
        DATABASES.FINANCE,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        {
          userId: user.userId,
          ...data
        }
      );
      
      const newTransaction: Transaction = {
        id: response.$id,
        userId: response.userId,
        amount: response.amount,
        type: response.type,
        description: response.description,
        category: response.category,
        date: response.date,
        isRecurring: response.isRecurring,
        recurringId: response.recurringId,
        notes: response.notes,
        receiptUrl: response.receiptUrl,
        createdAt: response.$createdAt,
        updatedAt: response.$updatedAt
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      setError(error.message || 'Failed to create transaction');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an existing transaction
  const updateTransaction = async (id: string, data: Partial<CreateTransactionDTO>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await databases.updateDocument(
        DATABASES.FINANCE,
        COLLECTIONS.TRANSACTIONS,
        id,
        data
      );
      
      const updatedTransaction: Transaction = {
        id: response.$id,
        userId: response.userId,
        amount: response.amount,
        type: response.type,
        description: response.description,
        category: response.category,
        date: response.date,
        isRecurring: response.isRecurring,
        recurringId: response.recurringId,
        notes: response.notes,
        receiptUrl: response.receiptUrl,
        createdAt: response.$createdAt,
        updatedAt: response.$updatedAt
      };
      
      setTransactions(prev => 
        prev.map(t => (t.id === id ? updatedTransaction : t))
      );
      
      return updatedTransaction;
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      setError(error.message || 'Failed to update transaction');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await databases.deleteDocument(
        DATABASES.FINANCE,
        COLLECTIONS.TRANSACTIONS,
        id
      );
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      setError(error.message || 'Failed to delete transaction');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transactions on mount or when user changes
  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [user]);
  
  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
  };
}