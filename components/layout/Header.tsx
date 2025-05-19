'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Moon, Sun, BellIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { formatDate, isPaymentDueSoon } from '@/lib/utils/date-utils';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { subscriptions } = useSubscriptions();
  
  // Get upcoming renewals (due in next 7 days)
  const upcomingRenewals = subscriptions.filter(sub => 
    sub.isActive && isPaymentDueSoon(sub.nextBillingDate, 7)
  );

  // Effect for theme mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn('h-16 border-b', className)} />;
  }

  return (
    <header className={cn('h-16 border-b flex items-center px-4 md:px-6', className)}>
      <div className="ml-auto flex items-center space-x-2">
        {/* Notifications dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              {upcomingRenewals.length > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium">Notifications</p>
            </div>
            {upcomingRenewals.length === 0 ? (
              <div className="px-4 py-3">
                <p className="text-sm text-muted-foreground">No upcoming renewals</p>
              </div>
            ) : (
              upcomingRenewals.map(sub => (
                <DropdownMenuItem key={sub.id} className="flex flex-col items-start px-4 py-2">
                  <span className="font-medium">{sub.name} renewal</span>
                  <div className="flex justify-between w-full text-sm text-muted-foreground">
                    <span>Due {formatDate(sub.nextBillingDate)}</span>
                    <span>${sub.amount.toFixed(2)}</span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}