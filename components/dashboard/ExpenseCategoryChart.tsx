'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { calculateCategoryBreakdown } from '@/lib/utils/finance-utils';
import { Transaction } from '@/lib/types';
import { TRANSACTION_CATEGORIES } from '@/lib/constants';

interface ExpenseCategoryChartProps {
  transactions: Transaction[];
  className?: string;
}

export default function ExpenseCategoryChart({ transactions, className }: ExpenseCategoryChartProps) {
  // Calculate category breakdown from transactions
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(transactions);
  }, [transactions]);
  
  // Map category data for the chart
  const chartData = useMemo(() => {
    return categoryBreakdown.map(category => ({
      name: TRANSACTION_CATEGORIES.find(c => c.id === category.categoryId)?.name || category.categoryName,
      value: category.amount,
      color: category.color,
      percentage: category.percentage,
    }));
  }, [categoryBreakdown]);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground p-3 rounded-md shadow-md border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">${data.value.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };
  
  // Render empty state if no data
  if (categoryBreakdown.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No expense data available</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={40}
                paddingAngle={2}
                label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}