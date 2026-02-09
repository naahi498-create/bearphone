import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/sections/Header';
import { Dashboard } from '@/sections/Dashboard';
import { NewSaleForm } from '@/sections/NewSaleForm';
import { SalesList } from '@/sections/SalesList';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaleCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in">
            <Dashboard />
            <div className="px-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800">آخر الفواتير</h2>
              <SalesList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        );
      case 'new-sale':
        return (
          <div className="p-4 animate-fade-in">
            <NewSaleForm onSaleCreated={handleSaleCreated} />
          </div>
        );
      case 'sales':
        return (
          <div className="p-4 animate-fade-in">
            <SalesList refreshTrigger={refreshTrigger} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          style: {
            fontFamily: 'Cairo, sans-serif',
          },
        }}
      />
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6">
        {renderContent()}
      </main>
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p className="font-medium">© 2024 Bear Phone - دب فون. جميع الحقوق محفوظة.</p>
          <p className="mt-1">نظام نقاط البيع المتكامل</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
