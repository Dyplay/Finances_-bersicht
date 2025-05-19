'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { TRANSACTION_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Define form schema
const transactionSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be positive')
    .refine((val) => !isNaN(val), { message: 'Invalid number' }),
  type: z.enum(['income', 'expense'], {
    required_error: 'Please select a transaction type',
  }),
  description: z
    .string()
    .min(2, 'Description must be at least 2 characters')
    .max(100, 'Description must be less than 100 characters'),
  category: z.string({
    required_error: 'Please select a category',
  }),
  date: z.date({
    required_error: 'Please select a date',
  }),
  isRecurring: z.boolean().default(false),
  notes: z.string().optional(),
});

interface TransactionFormProps {
  onSubmit: (data: z.infer<typeof transactionSchema>) => void;
  initialData?: any;
  onCancel?: () => void;
}

export default function TransactionForm({
  onSubmit,
  initialData,
  onCancel,
}: TransactionFormProps) {
  const defaultValues = initialData
    ? {
        ...initialData,
        date: new Date(initialData.date),
      }
    : {
        amount: '',
        type: 'expense' as const,
        description: '',
        category: '',
        date: new Date(),
        isRecurring: false,
        notes: '',
      };

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });

  // Filter categories based on transaction type
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    initialData?.type || 'expense'
  );

  const filteredCategories = TRANSACTION_CATEGORIES.filter((category) => {
    if (transactionType === 'income') {
      return category.id === 'income' || category.id === 'other';
    }
    return category.id !== 'income';
  });

  const handleTypeChange = (value: 'income' | 'expense') => {
    setTransactionType(value);
    
    // Reset category if changing from income to expense or vice versa
    const currentCategory = form.getValues('category');
    const categoryExists = filteredCategories.some(c => c.id === currentCategory);
    
    if (!categoryExists) {
      form.setValue('category', '');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      $
                    </span>
                    <Input
                      {...field}
                      placeholder="0.00"
                      className="pl-7"
                      type="number"
                      step="0.01"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={(value: 'income' | 'expense') => {
                    field.onChange(value);
                    handleTypeChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories.map((category) => (
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Recurring Transaction</FormLabel>
                <FormDescription>
                  Mark as a recurring transaction
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add any additional notes here"
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Transaction
          </Button>
        </div>
      </form>
    </Form>
  );
}