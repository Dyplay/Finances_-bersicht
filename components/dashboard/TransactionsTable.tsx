'use client';

import { useState } from 'react';
import { Transaction } from '@/lib/types';
import { formatDate } from '@/lib/utils/date-utils';
import { formatCurrency } from '@/lib/utils/finance-utils';
import { TRANSACTION_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TransactionForm from '@/components/transactions/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';

interface TransactionsTableProps {
  transactions: Transaction[];
  limit?: number;
  showActions?: boolean;
  className?: string;
}

export default function TransactionsTable({
  transactions,
  limit,
  showActions = true,
  className,
}: TransactionsTableProps) {
  const { updateTransaction, deleteTransaction } = useTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;
  
  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };
  
  const handleUpdate = async (data: any) => {
    if (selectedTransaction) {
      await updateTransaction(selectedTransaction.id, data);
      setIsDialogOpen(false);
      setSelectedTransaction(null);
    }
  };
  
  const getCategoryColor = (categoryId: string) => {
    const category = TRANSACTION_CATEGORIES.find(c => c.id === categoryId);
    return category?.color || '#94A3B8';
  };
  
  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 5 : 4} className="text-center text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            displayTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getCategoryColor(transaction.category) }}
                    />
                    {TRANSACTION_CATEGORIES.find(c => c.id === transaction.category)?.name || transaction.category}
                  </div>
                </TableCell>
                <TableCell className={cn(
                  "text-right font-medium",
                  transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                )}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionForm
              onSubmit={handleUpdate}
              initialData={selectedTransaction}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}