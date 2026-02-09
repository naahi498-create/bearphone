import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import type { Sale } from '@/types';
import { Button } from '@/components/ui/button';
import { Printer, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SalesListProps {
  refreshTrigger?: number;
}

export function SalesList({ refreshTrigger }: SalesListProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, [refreshTrigger]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await api.getSales();
      if (response.success && response.data) {
        setSales(response.data);
      } else {
        toast.error(response.message || 'فشل في تحميل البيانات');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل البيانات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (saleId: number) => {
    window.open(api.getInvoicePdfUrl(saleId), '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ريال';
  };

  const getWarrantyBadge = (warrantyDuration: string) => {
    if (warrantyDuration === 'بدون ضمان') {
      return <Badge variant="secondary">{warrantyDuration}</Badge>;
    }
    return <Badge className="bg-green-500 hover:bg-green-600">{warrantyDuration}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle className="text-xl">قائمة الفواتير</CardTitle>
        <Button variant="outline" size="sm" onClick={loadSales}>
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {sales.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">لا توجد فواتير حالياً</p>
            <p className="text-sm mt-2">قم بإنشاء فاتورة جديدة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-bold">رقم الفاتورة</TableHead>
                  <TableHead className="text-right font-bold">التاريخ</TableHead>
                  <TableHead className="text-right font-bold">العميل</TableHead>
                  <TableHead className="text-right font-bold">الجهاز</TableHead>
                  <TableHead className="text-right font-bold">الصافي</TableHead>
                  <TableHead className="text-right font-bold">الضمان</TableHead>
                  <TableHead className="text-right font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{sale.id}</TableCell>
                    <TableCell>{formatDate(sale.saleDate)}</TableCell>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={sale.itemDescription}>
                      {sale.itemDescription}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(sale.netAmount)}
                    </TableCell>
                    <TableCell>{getWarrantyBadge(sale.warrantyDuration)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrint(sale.id)}
                        title="طباعة الفاتورة"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
