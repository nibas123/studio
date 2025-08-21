import Dashboard from '@/components/timeflow/dashboard';

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Dashboard />
      </main>
    </div>
  );
}
