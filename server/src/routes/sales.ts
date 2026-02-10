import { Router } from 'express';
import axios from 'axios';

const router = Router();

// ================== UltraMsg Config (اكتب بياناتك هنا مباشرة) ==================
// 🔴 استبدل الكلام الموجود هنا ببياناتك الحقيقية لكي يعمل الواتساب فوراً
const ULTRAMSG_INSTANCE = 'instance103848'; // مثال: instanceXXXXX
const ULTRAMSG_TOKEN = 'token123456';       // مثال: your_token_here
const PUBLIC_API_URL = 'https://bearphone.onrender.com/api'; // رابط موقعك

// ================== In-Memory Storage ==================
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

// ================== Helpers ==================
function formatPhone(phone: string): string {
  // دالة ذكية: تحول 050xxxx إلى 96650xxxx
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

  // رابط الفاتورة (حالياً نضع رابط JSON كمثال)
  const invoiceUrl = `${PUBLIC_API_URL}/sales/${sale.id}`;

  const message = `
🐻 *دب فون - فاتورة جديدة*

👤 العميل: ${sale.customerName}
🧾 رقم الفاتورة: #${sale.id}
💰 الإجمالي: ${sale.totalAmount} ريال
📅 التاريخ: ${new Date(sale.date).toLocaleDateString('ar-SA')}

🙏 شكراً لتعاملك معنا!
  `.trim();

  // إرسال الرسالة باستخدام axios
  await axios.post(
    `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}/messages/chat`,
    new URLSearchParams({
      token: ULTRAMSG_TOKEN,
      to: formatPhone(sale.customerPhone),
      body: message,
    })
  );

  console.log('📱 WhatsApp sent to:', formatPhone(sale.customerPhone));
}

// ================== Routes ==================

// 🔹 Dashboard stats
router.get('/stats/dashboard', (req: any, res: any) => {
  const totalSales = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
  res.json({
    success: true,
    data: {
      todaySales: totalSales,
      transactions: sales.length,
      growth: sales.length > 0 ? 100 : 0,
    },
  });
});

// 🔹 Get all sales
router.get('/', (req: any, res: any) => {
  res.json({
    success: true,
    data: [...sales].reverse(),
  });
});

// 🔹 Create sale + WhatsApp (القلب النابض)
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
    console.log('✅ Sale created:', newSale.id);

    // نرسل الرد للموقع فوراً لكي لا يعلق
    res.json({
      success: true,
      data: newSale,
    });

    // ثم نحاول إرسال الواتساب في الخلفية
    if (newSale.customerPhone) {
        sendWhatsAppInvoice(newSale).catch(err => 
            console.error('⚠️ WhatsApp failed (Check token/instance):', err.message)
        );
    }

  } catch (error) {
    console.error('❌ Create sale error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل إنشاء الفاتورة',
    });
  }
});

// 🔹 Get sale by ID
router.get('/:id', (req: any, res: any) => {
  const sale = sales.find(s => s.id === Number(req.params.id));
  if (!sale) {
    return res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
  }
  res.json({ success: true, data: sale });
});

export default router;
