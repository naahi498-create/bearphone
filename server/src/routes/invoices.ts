import { Router } from 'express';
import axios from 'axios';

const router = Router();

// ================== إعدادات UltraMsg ==================
const ULTRAMSG_INSTANCE = 'instance103848'; // استبدل ببياناتك
const ULTRAMSG_TOKEN = 'token123456';       // استبدل ببياناتك
const PUBLIC_API_URL = 'https://bearphone.onrender.com/api';

// ================== In-Memory Storage ==================
interface Sale {
  id: number;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  items: any[];
  date: string;
}

let sales: Sale[] = [];

// ================== Helpers ==================
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
    console.log('📱 WhatsApp sent');
  } catch (error: any) {
    console.error('⚠️ WhatsApp failed:', error.message);
  }
}

// ================== Routes ==================
router.get('/stats/dashboard', (req: any, res: any) => {
  const totalSales = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
  res.json({ success: true, data: { todaySales: totalSales, transactions: sales.length, growth: 100 } });
});

router.get('/', (req: any, res: any) => {
  res.json({ success: true, data: [...sales].reverse() });
});

router.post('/', async (req: any, res: any) => {
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
    
    res.json({ success: true, data: newSale }); // رد سريع
    if (newSale.customerPhone) sendWhatsAppInvoice(newSale); // واتساب في الخلفية

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

router.get('/:id', (req: any, res: any) => {
  const sale = sales.find(s => s.id === Number(req.params.id));
  if (!sale) return res.status(404).json({ success: false, message: 'Not Found' });
  res.json({ success: true, data: sale });
});

export default router;
