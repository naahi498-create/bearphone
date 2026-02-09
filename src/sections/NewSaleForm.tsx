import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/services/api';
import { WARRANTY_OPTIONS, type WarrantyDuration } from '@/types';
import { Plus, Printer, MessageCircle, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface NewSaleFormProps {
  onSaleCreated?: () => void;
}

interface FormData {
  customerName: string;
  phone: string;
  itemDescription: string;
  quantity: number;
  price: number;
  discount: number;
  paid: number;
  warrantyDuration: WarrantyDuration;
  notes: string;
}

export function NewSaleForm({ onSaleCreated }: NewSaleFormProps) {
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    phone: '966',
    itemDescription: '',
    quantity: 1,
    price: 0,
    discount: 0,
    paid: 0,
    warrantyDuration: 'بدون ضمان',
    notes: '',
  });

  const [netAmount, setNetAmount] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [createdSaleId, setCreatedSaleId] = useState<number | null>(null);

  // Calculate net amount and remaining when values change
  useEffect(() => {
    const total = formData.price * formData.quantity;
    const net = total - formData.discount;
    const rem = net - formData.paid;
    setNetAmount(net > 0 ? net : 0);
    setRemaining(rem > 0 ? rem : 0);
  }, [formData.price, formData.quantity, formData.discount, formData.paid]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    let phone = value.replace(/\D/g, '');
    if (!phone.startsWith('966')) {
      phone = '966' + phone.replace(/^966/, '');
    }
    setFormData((prev) => ({ ...prev, phone }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName.trim()) {
      toast.error('يرجى إدخال اسم العميل');
      return;
    }
    
    if (!formData.itemDescription.trim()) {
      toast.error('يرجى إدخال نوع الجهاز');
      return;
    }
    
    if (formData.price <= 0) {
      toast.error('يرجى إدخال سعر صحيح');
      return;
    }

    setLoading(true);

    try {
      const response = await api.createSale({
        customerName: formData.customerName,
        phone: formData.phone,
        itemDescription: formData.itemDescription,
        quantity: formData.quantity,
        price: formData.price,
        discount: formData.discount,
        paid: formData.paid,
        warrantyDuration: formData.warrantyDuration,
        notes: formData.notes,
      });

      if (response.success && response.data) {
        toast.success('تم إنشاء الفاتورة بنجاح!');
        setCreatedSaleId(response.data.id);
        
        // Reset form
        setFormData({
          customerName: '',
          phone: '966',
          itemDescription: '',
          quantity: 1,
          price: 0,
          discount: 0,
          paid: 0,
          warrantyDuration: 'بدون ضمان',
          notes: '',
        });
        
        onSaleCreated?.();
      } else {
        toast.error(response.message || 'فشل في إنشاء الفاتورة');
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (createdSaleId) {
      window.open(api.getInvoicePdfUrl(createdSaleId), '_blank');
    }
  };

  const handleWhatsApp = () => {
    if (createdSaleId) {
      toast.success('تم إرسال رسالة الواتساب!');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          <Plus className="w-6 h-6" />
          فاتورة جديدة
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-right block font-semibold">
              اسم العميل <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="أدخل اسم العميل"
              className="rtl-input text-right h-11"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-right block font-semibold">
              رقم الجوال <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="9665XXXXXXXX"
              className="rtl-input-left text-left h-11 font-mono"
              dir="ltr"
              required
            />
          </div>

          {/* Device/Item */}
          <div className="space-y-2">
            <Label htmlFor="itemDescription" className="text-right block font-semibold">
              نوع الجهاز / الصنف <span className="text-red-500">*</span>
            </Label>
            <Input
              id="itemDescription"
              value={formData.itemDescription}
              onChange={(e) => handleInputChange('itemDescription', e.target.value)}
              placeholder="مثال: شاشة ايفون 11 برو"
              className="rtl-input text-right h-11"
              required
            />
          </div>

          {/* Quantity and Price - Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-right block font-semibold">
                العدد
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                placeholder="1"
                className="rtl-input text-right h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-right block font-semibold">
                السعر <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="rtl-input text-right h-11"
                required
              />
            </div>
          </div>

          {/* Discount and Paid - Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-right block font-semibold">
                الخصم
              </Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discount || ''}
                onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="rtl-input text-right h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid" className="text-right block font-semibold">
                المدفوع
              </Label>
              <Input
                id="paid"
                type="number"
                min="0"
                step="0.01"
                value={formData.paid || ''}
                onChange={(e) => handleInputChange('paid', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="rtl-input text-right h-11"
              />
            </div>
          </div>

          {/* Net Amount and Remaining - Auto calculated */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="netAmount" className="text-right block font-semibold">
                الصافي
              </Label>
              <div className="relative">
                <Input
                  id="netAmount"
                  type="number"
                  value={netAmount.toFixed(2)}
                  readOnly
                  className="rtl-input text-right bg-green-50 border-green-300 text-green-700 font-bold h-11"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-medium">
                  ريال
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remaining" className="text-right block font-semibold">
                المتبقي
              </Label>
              <div className="relative">
                <Input
                  id="remaining"
                  type="number"
                  value={remaining.toFixed(2)}
                  readOnly
                  className={`rtl-input text-right h-11 font-bold ${
                    remaining > 0 
                      ? 'bg-red-50 border-red-300 text-red-700' 
                      : 'bg-green-50 border-green-300 text-green-700'
                  }`}
                />
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-medium ${
                  remaining > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ريال
                </span>
              </div>
            </div>
          </div>

          {/* Warranty Duration */}
          <div className="space-y-2">
            <Label htmlFor="warrantyDuration" className="text-right block font-semibold">
              مدة الضمان
            </Label>
            <Select
              value={formData.warrantyDuration}
              onValueChange={(value) => handleInputChange('warrantyDuration', value as WarrantyDuration)}
            >
              <SelectTrigger className="rtl-input text-right h-11">
                <SelectValue placeholder="اختر مدة الضمان" />
              </SelectTrigger>
              <SelectContent>
                {WARRANTY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes - Prominent Text Area */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-right block font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              ملاحظات / Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="أي ملاحظات إضافية... (سيظهر في الفاتورة ورسالة الواتساب)"
              className="rtl-input text-right min-h-[100px] resize-none border-2 border-gray-200 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 text-right">
              إذا تركت هذا الحقل فارغاً، سيظهر "لا يوجد" في الفاتورة
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 ml-2" />
                إنشاء الفاتورة
              </>
            )}
          </Button>
        </form>

        {/* Action Buttons after successful creation */}
        {createdSaleId && (
          <div className="mt-6 pt-6 border-t animate-slide-in">
            <p className="text-center text-green-600 mb-4 font-bold text-lg">
              تم إنشاء الفاتورة رقم {createdSaleId}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 border-green-500 text-green-600 hover:bg-green-50 py-5"
                onClick={handlePrint}
              >
                <Printer className="w-5 h-5 ml-2" />
                طباعة الفاتورة
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 py-5"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                إرسال واتساب
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
