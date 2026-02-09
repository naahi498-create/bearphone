import PDFDocument from 'pdfkit';
import type { Sale } from '../types';
import { join } from 'path';
import { existsSync } from 'fs';

export function generateInvoicePDF(sale: Sale): PDFKit.PDFDocument {
  // Create document with proper margins
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 40,
    layout: 'portrait',
    bufferPages: true
  });

  const pageWidth = doc.page.width;
  const centerX = pageWidth / 2;
  let currentY = 30;

  // Try to load custom Arabic font if available
  const fontPath = join(process.cwd(), 'public', 'assets', 'Cairo-Regular.ttf');
  const fontBoldPath = join(process.cwd(), 'public', 'assets', 'Cairo-Bold.ttf');
  
  if (existsSync(fontPath)) {
    doc.registerFont('Arabic', fontPath);
    doc.registerFont('ArabicBold', fontBoldPath);
  } else {
    // Fallback to Helvetica
    doc.registerFont('Arabic', 'Helvetica');
    doc.registerFont('ArabicBold', 'Helvetica-Bold');
  }

  // ==================== HEADER SECTION ====================
  
  // Logo placeholder (centered circle with bear emoji)
  doc.save();
  doc.translate(centerX - 35, currentY);
  doc.circle(35, 35, 35).fill('#2563eb');
  doc.restore();
  
  // Bear emoji in circle
  doc.font('ArabicBold');
  doc.fontSize(36);
  doc.fillColor('#ffffff');
  doc.text('🐻', centerX - 18, currentY + 18, { align: 'center' });
  
  currentY += 85;
  
  // BEAR PHONE (English)
  doc.font('ArabicBold');
  doc.fontSize(22);
  doc.fillColor('#1e3a5f');
  doc.text('BEAR PHONE', centerX, currentY, { align: 'center' });
  
  currentY += 28;
  
  // دب فون (Arabic)
  doc.font('Arabic');
  doc.fontSize(18);
  doc.fillColor('#2563eb');
  doc.text('دب فون', centerX, currentY, { align: 'center' });
  
  currentY += 35;
  
  // فاتورة بيع ضريبية مبسطة (Invoice Title)
  doc.font('ArabicBold');
  doc.fontSize(16);
  doc.fillColor('#1e3a5f');
  doc.text('فاتورة بيع ضريبية مبسطة', centerX, currentY, { align: 'center' });
  
  currentY += 40;
  
  // ==================== METADATA SECTION ====================
  
  // Horizontal line
  doc.strokeColor('#e5e7eb');
  doc.lineWidth(1);
  doc.moveTo(40, currentY).lineTo(pageWidth - 40, currentY).stroke();
  
  currentY += 15;
  
  // Right side: Date and Customer
  const rightX = pageWidth - 40;
  
  // Date with time (format: YYYY-MM-DD HH:MM:SS AM/PM)
  const dateStr = formatDateTime(sale.saleDate);
  doc.font('Arabic');
  doc.fontSize(11);
  doc.fillColor('#374151');
  doc.text(`التاريخ: ${dateStr}`, rightX, currentY, { align: 'right' });
  
  currentY += 20;
  
  // Customer Name
  doc.text(`المكرم: ${sale.customerName}`, rightX, currentY, { align: 'right' });
  
  // Left side: Invoice Number
  const leftX = 40;
  doc.font('ArabicBold');
  doc.fontSize(12);
  doc.fillColor('#1e3a5f');
  doc.text(`رقم الفاتورة: ${sale.id}`, leftX, currentY - 20);
  
  currentY += 35;
  
  // ==================== ITEMS TABLE ====================
  
  // Table header background
  doc.fillColor('#f3f4f6');
  doc.rect(40, currentY, pageWidth - 80, 30).fill();
  
  // Table header text (RTL: الاجمالي | السعر | العدد | الصنف)
  doc.font('ArabicBold');
  doc.fontSize(11);
  doc.fillColor('#1f2937');
  
  const colWidths = [90, 70, 50, 180]; // Total, Price, Qty, Item
  const tableRight = pageWidth - 40;
  
  let colX = tableRight;
  
  // الاجمالي (Total)
  colX -= colWidths[0];
  doc.text('الاجمالي', colX + 5, currentY + 8, { width: colWidths[0] - 10, align: 'center' });
  
  // السعر (Price)
  colX -= colWidths[1];
  doc.text('السعر', colX + 5, currentY + 8, { width: colWidths[1] - 10, align: 'center' });
  
  // العدد (Quantity)
  colX -= colWidths[2];
  doc.text('العدد', colX + 5, currentY + 8, { width: colWidths[2] - 10, align: 'center' });
  
  // الصنف (Item)
  colX -= colWidths[3];
  doc.text('الصنف', colX + 5, currentY + 8, { width: colWidths[3] - 10, align: 'center' });
  
  currentY += 30;
  
  // Table row background (white)
  doc.fillColor('#ffffff');
  doc.rect(40, currentY, pageWidth - 80, 30).fill();
  
  // Table row data
  doc.font('Arabic');
  doc.fontSize(11);
  doc.fillColor('#374151');
  
  colX = tableRight;
  
  // الاجمالي value
  const total = sale.price * sale.quantity;
  colX -= colWidths[0];
  doc.text(total.toFixed(2), colX + 5, currentY + 8, { width: colWidths[0] - 10, align: 'center' });
  
  // السعر value
  colX -= colWidths[1];
  doc.text(sale.price.toFixed(2), colX + 5, currentY + 8, { width: colWidths[1] - 10, align: 'center' });
  
  // العدد value
  colX -= colWidths[2];
  doc.text(sale.quantity.toString(), colX + 5, currentY + 8, { width: colWidths[2] - 10, align: 'center' });
  
  // الصنف value
  colX -= colWidths[3];
  doc.text(sale.itemDescription, colX + 5, currentY + 8, { width: colWidths[3] - 10, align: 'right' });
  
  // Draw table borders
  doc.strokeColor('#d1d5db');
  doc.lineWidth(0.5);
  
  // Outer border
  doc.rect(40, currentY - 30, pageWidth - 80, 60).stroke();
  
  // Vertical lines
  let lineX = tableRight - colWidths[0];
  doc.moveTo(lineX, currentY - 30).lineTo(lineX, currentY + 30).stroke();
  
  lineX -= colWidths[1];
  doc.moveTo(lineX, currentY - 30).lineTo(lineX, currentY + 30).stroke();
  
  lineX -= colWidths[2];
  doc.moveTo(lineX, currentY - 30).lineTo(lineX, currentY + 30).stroke();
  
  currentY += 50;
  
  // ==================== TOTALS SECTION ====================
  
  const totalsX = pageWidth - 40;
  const labelWidth = 120;
  const valueWidth = 80;
  const rowHeight = 22;
  
  doc.font('Arabic');
  doc.fontSize(11);
  
  // الاجمالي (Total)
  doc.fillColor('#374151');
  doc.text('الاجمالي:', totalsX - labelWidth - valueWidth, currentY, { width: labelWidth, align: 'right' });
  doc.fillColor('#1f2937');
  doc.text(total.toFixed(2), totalsX - valueWidth, currentY, { width: valueWidth, align: 'left' });
  currentY += rowHeight;
  
  // الخصم (Discount)
  doc.fillColor('#374151');
  doc.text('الخصم:', totalsX - labelWidth - valueWidth, currentY, { width: labelWidth, align: 'right' });
  doc.fillColor('#dc2626');
  doc.text(sale.discount.toFixed(2), totalsX - valueWidth, currentY, { width: valueWidth, align: 'left' });
  currentY += rowHeight;
  
  // الصافي (Net) - Bold
  doc.font('ArabicBold');
  doc.fillColor('#059669');
  doc.text('الصافي:', totalsX - labelWidth - valueWidth, currentY, { width: labelWidth, align: 'right' });
  doc.text(sale.netAmount.toFixed(2), totalsX - valueWidth, currentY, { width: valueWidth, align: 'left' });
  currentY += rowHeight;
  
  // المدفوع (Paid)
  doc.font('Arabic');
  doc.fillColor('#374151');
  doc.text('المدفوع:', totalsX - labelWidth - valueWidth, currentY, { width: labelWidth, align: 'right' });
  doc.fillColor('#1f2937');
  doc.text(sale.paid.toFixed(2), totalsX - valueWidth, currentY, { width: valueWidth, align: 'left' });
  currentY += rowHeight;
  
  // المتبقي على العميل (Remaining)
  doc.fillColor('#374151');
  doc.text('المتبقي على العميل:', totalsX - labelWidth - valueWidth, currentY, { width: labelWidth, align: 'right' });
  doc.fillColor(sale.remaining > 0 ? '#dc2626' : '#059669');
  doc.text(sale.remaining.toFixed(2), totalsX - valueWidth, currentY, { width: valueWidth, align: 'left' });
  currentY += rowHeight + 10;
  
  // ==================== WARRANTY SECTION ====================
  if (sale.warrantyDuration !== 'بدون ضمان') {
    doc.font('Arabic');
    doc.fontSize(10);
    doc.fillColor('#6b7280');
    doc.text(`الضمان: ${sale.warrantyDuration}`, 40, currentY);
    if (sale.warrantyExpiry) {
      doc.text(`تاريخ الانتهاء: ${formatDate(sale.warrantyExpiry)}`, 40, currentY + 15);
    }
    currentY += 40;
  }
  
  // ==================== NOTES SECTION ====================
  
  // Horizontal line above notes
  doc.strokeColor('#e5e7eb');
  doc.lineWidth(0.5);
  doc.moveTo(40, currentY).lineTo(pageWidth - 40, currentY).stroke();
  
  currentY += 15;
  
  // Notes label
  doc.font('ArabicBold');
  doc.fontSize(11);
  doc.fillColor('#374151');
  doc.text('ملاحظات:', pageWidth - 40, currentY, { align: 'right' });
  
  currentY += 18;
  
  // Notes content
  doc.font('Arabic');
  doc.fontSize(10);
  doc.fillColor('#6b7280');
  const notesText = sale.notes && sale.notes.trim() !== '' ? sale.notes : 'لا يوجد';
  doc.text(notesText, pageWidth - 40, currentY, { 
    align: 'right', 
    width: pageWidth - 80,
    lineGap: 3
  });
  
  // ==================== FOOTER ====================
  
  const footerY = doc.page.height - 60;
  
  // Center line
  doc.strokeColor('#e5e7eb');
  doc.moveTo(100, footerY - 10).lineTo(pageWidth - 100, footerY - 10).stroke();
  
  doc.font('Arabic');
  doc.fontSize(9);
  doc.fillColor('#9ca3af');
  doc.text('شكراً لتعاملكم مع دب فون', centerX, footerY, { align: 'center' });
  doc.text('للاستفسارات: 966500000000+', centerX, footerY + 14, { align: 'center' });
  
  doc.end();
  return doc;
}

function formatDateTime(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  return `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
