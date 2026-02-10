import express from 'express';
import cors from 'cors';
import path from 'path';
import axios from 'axios';

// ================== 1. إعدادات السيرفر ==================
const app = express();
const port = parseInt(process.env.PORT || '10000', 10);

// ================== 2. إعدادات UltraMsg (واتساب) ==================
// 🔴 ضع بياناتك هنا ليعمل الواتساب
const ULTRAMSG_INSTANCE = 'instance103848'; 
const ULTRAMSG_TOKEN = 'token123456';       
const PUBLIC_API_URL = 'https://bearphone.onrender.com';

// ================== 3. قاعدة البيانات المؤقتة ==================
interface Sale {
  id: number;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  items: any[];
  date: string;
}

// نبدأ بمصفوفة فارغة
let sales: Sale[] = [];

// ================== 4. دوال مساعدة ==================
function formatPhone(phone: string): string {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('05')) {
    p = '966' + p.substring(1);
  } else if (p.startsWith('5') && p.length === 9) {
    p = '966' + p;
  }
  return p;
}

async function sendWhatsAppInvoice(sale: Sale) {
  if (!sale.customerPhone) return;

  const invoiceUrl = `${PUBLIC_API_URL}/api/sales/${sale.id}`;
  const message = `
🐻 *دب فون - فاتورة جديدة*

👤 العميل: ${sale.customerName}
🧾 رقم الفاتورة: #${sale.id}
💰 الإجمالي: ${sale.totalAmount} ريال
📅 التاريخ: ${new Date(sale.date).toLocaleDateString('ar-SA')}

🙏 شكراً لتعاملك معنا!
  `.trim();

  try {
    await axios.post(
      `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}/messages/chat`,
      new URLSearchParams({
        token: ULTRAMSG_TOKEN,
        to: formatPhone(sale.customerPhone),
        body: message,
      })
    );
    console.log('📱 WhatsApp sent to:', formatPhone(sale.customerPhone));
  } catch (error: any) {
    console.error('⚠️ WhatsApp failed:', error.message);
  }
}

// ================== 5. البرمجيات الوسيطة (Middlewares) ==================
app.use(cors());
app.use(express.json());

// تسجيل الطلبات
app.use((req: any, res: any, next: any) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ================== 6. روابط الفواتير (API Routes) ==================

// أ) إحصائيات الداشبورد
app.get('/api/sales/stats/dashboard', (req: any, res: any) => {
  const totalSales = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
  res.json({
    success: true,
    data: { todaySales: totalSales, transactions: sales.length, growth: 100 },
  });
});

// ب) جلب كل الفواتير
app.get('/api/sales', (req: any, res: any) => {
  res.json({ success: true, data: [...sales].reverse() });
});

// ج) إنشاء فاتورة جديدة + واتساب
app.post('/api/sales', async (req: any, res: any) => {
  try {
    const newSale: Sale = {
      id: sales.length + 1,
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      totalAmount: req.body.totalAmount,
      items: req.body.items || [],
      date: new Date().toISOString(),
    };

    sales.push(newSale);
    console.log('✅ Sale created:', newSale.id);

    res.json({ success: true, data: newSale });

    // إرسال الواتساب
    if (newSale.customerPhone) {
        sendWhatsAppInvoice(newSale);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

// د) جلب فاتورة برقمها
app.get('/api/sales/:id', (req: any, res: any) => {
  const sale = sales.find(s => s.id === Number(req.params.id));
  if (!sale) return res.status(404).json({ success: false, message: 'Not Found' });
  res.json({ success: true, data: sale });
});

// ================== 7. تشغيل الموقع (Frontend) ==================
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// التعامل مع أي رابط آخر (للموقع)
app.use((req: any, res: any) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API Not Found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// ================== 8. تشغيل السيرفر ==================
app.listen(port, () => {
  console.log(`🚀 Bear Phone Server running on port ${port}`);
});
