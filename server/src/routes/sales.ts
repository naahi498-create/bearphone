import { Router, Request, Response } from 'express';
import { db } from '../../database/db';
import { sales } from '../../database/schema';
import { eq, desc, gte, sql } from 'drizzle-orm';
import type { CreateSaleRequest } from '../types';
import { calculateWarrantyExpiry } from '../types';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { generateInvoicePDF } from '../utils/pdf';

const router = Router();

// POST /api/sales - Create a new sale
router.post('/', async (req: Request, res: Response) => {
  try {
    const body: CreateSaleRequest = req.body;
    
    // Server-side date generation (CRITICAL FIX)
    const saleDate = new Date();
    
    // Calculate warranty expiry
    const warrantyExpiry = calculateWarrantyExpiry(saleDate, body.warrantyDuration);
    
    // Calculate net amount
    const netAmount = (body.price * body.quantity) - body.discount;
    
    // Calculate remaining
    const remaining = netAmount - body.paid;
    
    // Insert sale into database
    const [newSale] = await db.insert(sales).values({
      customerName: body.customerName,
      phone: body.phone,
      itemDescription: body.itemDescription,
      quantity: body.quantity,
      price: body.price,
      discount: body.discount,
      netAmount: netAmount,
      paid: body.paid,
      remaining: remaining,
      warrantyDuration: body.warrantyDuration,
      warrantyExpiry: warrantyExpiry,
      notes: body.notes || null,
      saleDate: saleDate,
    }).returning();

    console.log('✅ Sale created:', newSale.id);

    // Send WhatsApp message (non-blocking)
    try {
      await sendWhatsAppMessage(newSale as any);
    } catch (whatsappError) {
      console.error('❌ WhatsApp failed but sale saved:', whatsappError);
      // Sale is still saved, error is logged
    }

    res.status(201).json({
      success: true,
      data: newSale,
      message: 'تم إنشاء الفاتورة بنجاح',
    });
  } catch (error) {
    console.error('❌ Error creating sale:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء الفاتورة',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/sales - Get all sales
router.get('/', async (req: Request, res: Response) => {
  try {
    const allSales = await db.query.sales.findMany({
      orderBy: desc(sales.saleDate),
    });

    res.json({
      success: true,
      data: allSales,
    });
  } catch (error) {
    console.error('❌ Error fetching sales:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب البيانات',
    });
  }
});

// GET /api/sales/:id - Get sale by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const sale = await db.query.sales.findFirst({
      where: eq(sales.id, id),
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'الفاتورة غير موجودة',
      });
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error('❌ Error fetching sale:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب البيانات',
    });
  }
});

// GET /api/sales/:id/pdf - Generate PDF invoice
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const sale = await db.query.sales.findFirst({
      where: eq(sales.id, id),
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'الفاتورة غير موجودة',
      });
    }

    // Generate PDF
    const doc = generateInvoicePDF(sale as any);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${sale.id}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء ملف PDF',
    });
  }
});

// GET /api/sales/stats/dashboard - Get dashboard statistics
router.get('/stats/dashboard', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);

    // Get total sales count
    const totalSalesResult = await db.select({ count: sql<number>`count(*)` }).from(sales);
    const totalSales = totalSalesResult[0]?.count || 0;

    // Get total revenue
    const totalRevenueResult = await db.select({ sum: sql<number>`sum(net_amount)` }).from(sales);
    const totalRevenue = totalRevenueResult[0]?.sum || 0;

    // Get active warranties (warranty expiry > now)
    const now = new Date();
    const activeWarrantiesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(sales)
      .where(gte(sales.warrantyExpiry, now));
    const activeWarranties = activeWarrantiesResult[0]?.count || 0;

    // Get today's sales
    const todaySalesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(sales)
      .where(sql`unixepoch(sale_date) >= ${todayTimestamp}`);
    const todaySales = todaySalesResult[0]?.count || 0;

    res.json({
      success: true,
      data: {
        totalSales,
        totalRevenue,
        activeWarranties,
        todaySales,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الإحصائيات',
    });
  }
});

export default router;
