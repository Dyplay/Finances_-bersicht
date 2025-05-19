import AuthForm from '@/components/auth/AuthForm';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">FinTrack</h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight">Take control of your finances</h2>
            <p className="text-xl text-muted-foreground">
              Track expenses, monitor subscriptions, and visualize your spending habits all in one place.
            </p>
            <ul className="space-y-2">
              {[
                'Easily track income and expenses',
                'Monitor subscription renewals',
                'Visualize spending patterns',
                'Set and track financial goals',
                'Export reports and statements',
              ].map((feature, i) => (
                <li key={i} className="flex items-start">
                  <svg
                    className="h-5 w-5 mr-2 text-primary flex-shrink-0"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <AuthForm />
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 FinTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}