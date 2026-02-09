import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/services/api';
import type { DashboardStats } from '@/types';
import { TrendingUp, Shield, ShoppingCart, Calendar } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'إجمالي المبيعات',
      value: stats?.totalSales || 0,
      icon: ShoppingCart,
      gradient: 'bg-gradient-primary',
      suffix: 'فاتورة',
    },
    {
      title: 'إجمالي الإيرادات',
      value: stats?.totalRevenue || 0,
      icon: TrendingUp,
      gradient: 'bg-gradient-success',
      suffix: 'ريال',
    },
    {
      title: 'الضمانات السارية',
      value: stats?.activeWarranties || 0,
      icon: Shield,
      gradient: 'bg-gradient-warning',
      suffix: 'جهاز',
    },
    {
      title: 'مبيعات اليوم',
      value: stats?.todaySales || 0,
      icon: Calendar,
      gradient: 'bg-gradient-danger',
      suffix: 'فاتورة',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="card-hover overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div className={`${stat.gradient} p-4 flex items-center justify-center`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 p-4">
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">
                  {stat.value.toLocaleString('ar-SA')}
                  <span className="text-sm font-normal text-muted-foreground mr-1">
                    {stat.suffix}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
