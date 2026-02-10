import { Router } from 'express';
// import axios from 'axios'; // 🔴 عطلنا هذا السطر مؤقتاً لتجنب الأخطاء

const router = Router();

// ------------------ مخزن مؤقت للفواتير ------------------
// هنا نحفظ الفواتير في الذاكرة لكي تظهر في الموقع
let sales: any[] = [
  { 
    id: 1, 
    customerName: 'عميل تجريبي', 
    customerPhone: '966500000000', 
    totalAmount: 150, 
    date: new Date().toISOString(), 
    items: [] 
  }
];

// ------------------ جلب جميع الفواتير ------------------
router.get('/', (req, res) => {
  // نرسل البيانات بنفس الشكل الذي يتوقعه الموقع (Frontend)
  res.json(sales.slice().reverse()); 
});

// ------------------ جلب فاتورة محددة ------------------
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const sale = sales.find(s => s.id === id);
  if (sale) {
    res.json(sale);
  } else {
    res.status(404).json({ message: 'الفاتورة غير موجودة' });
  }
});

// ------------------ إنشاء فاتورة جديدة ------------------
router.post('/', (req, res) => {
  try {
    const newSale = {
      id: sales.length + 1,
      ...req.body,
      date: new Date().toISOString(),
    };
    
    sales.push(newSale);
    console.log('New Sale Created:', newSale);

    // ملاحظة: هنا سنقوم بتفعيل كود الواتساب لاحقاً بعد تثبيت المكتبة
    
    res.json(newSale);

  } catch (error) {
    console.error('Save Error:', error);
    res.status(500).json({ message: 'فشل الحفظ في السيرفر' });
  }
});

// ------------------ إحصائيات لوحة التحكم ------------------
router.get('/stats/dashboard', (req, res) => {
  const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  res.json({
    todaySales: totalSales,
    transactions: sales.length,
    growth: 0
  });
});

export default router;
