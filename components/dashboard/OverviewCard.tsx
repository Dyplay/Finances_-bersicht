'use client';

import { formatCurrency } from '@/lib/utils/finance-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingDown, TrendingUp } from 'lucide-react';

interface OverviewCardProps {
  title: string;
  value: number;
  trend?: number; // Percentage change
  type?: 'income' | 'expense' | 'neutral';
  icon?: React.ReactNode;
  currency?: boolean;
}

export default function OverviewCard({
  title,
  value,
  trend,
  type = 'neutral',
  icon,
  currency = true,
}: OverviewCardProps) {
  const isPositive = type === 'income' || (trend !== undefined && trend >= 0);
  const displayValue = currency ? formatCurrency(value) : value.toString();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon || (type === 'income' ? <ArrowUpRight /> : type === 'expense' ? <ArrowDownRight /> : null)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {trend !== undefined && (
          <p className={`text-xs flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            <span>{Math.abs(trend).toFixed(1)}% from last period</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}