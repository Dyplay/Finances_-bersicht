'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { calculateMonthlyTrends } from '@/lib/utils/finance-utils';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/finance-utils';
import { format, parseISO } from 'date-fns';

interface SpendingTrendChartProps {
  transactions: Transaction[];
  className?: string;
}

export default function SpendingTrendChart({ transactions, className }: SpendingTrendChartProps) {
  // Calculate monthly trends from transactions
  const monthlyTrends = useMemo(() => {
    return calculateMonthlyTrends(transactions);
  }, [transactions]);
  
  // Format data for chart display
  const chartData = useMemo(() => {
    return monthlyTrends.map(trend => ({
      month: trend.month,
      displayMonth: format(new Date(trend.month + '-01'), 'MMM'),
      income: trend.income,
      expenses: trend.expenses,
      savings: trend.savings,
    }));
  }, [monthlyTrends]);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const monthData = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground p-3 rounded-md shadow-md border">
          <p className="font-medium">{format(new Date(monthData.month + '-01'), 'MMMM yyyy')}</p>
          <p className="text-sm text-green-500">Income: {formatCurrency(monthData.income)}</p>
          <p className="text-sm text-red-500">Expenses: {formatCurrency(monthData.expenses)}</p>
          <p className="text-sm font-medium">
            Savings: {formatCurrency(monthData.savings)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Render empty state if no data
  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No transaction data available</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="displayMonth" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${value}`}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorExpenses)"
              />
              <Area
                type="monotone"
                dataKey="savings"
                name="Savings"
                stroke="hsl(var(--chart-3))"
                fillOpacity={1}
                fill="url(#colorSavings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}