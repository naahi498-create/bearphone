import fetch from 'node-fetch';
import type { Sale } from '../types';

const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID || '';
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN || '';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export async function sendWhatsAppMessage(sale: Sale): Promise<boolean> {
  try {
    if (!ULTRAMSG_INSTANCE_ID || !ULTRAMSG_TOKEN) {
      console.warn('⚠️ WhatsApp credentials not configured');
      return false;
    }

    const phone = formatPhoneNumber(sale.phone);
    const notes = sale.notes && sale.notes.trim() !== '' ? sale.notes : 'لا يوجد';

    const message = `مرحباً بك في *BEAR PHONE* 🐻

تم إصدار فاتورتك بنجاح:
🧾 رقم الفاتورة: ${sale.id}
💰 الصافي: ${sale.netAmount} ريال
📝 ملاحظات: ${notes}

📍 رابط الفاتورة: ${BASE_URL}/api/sales/${sale.id}/pdf`;

    const url = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: ULTRAMSG_TOKEN,
        to: phone,
        body: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WhatsApp API error:', errorText);
      return false;
    }

    const data = await response.json() as { success?: boolean };
    console.log('✅ WhatsApp message sent successfully');
    return data.success === true;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
    return false;
  }
}

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 966
  if (cleaned.startsWith('0')) {
    cleaned = '966' + cleaned.substring(1);
  }
  
  // If doesn't start with 966, add it
  if (!cleaned.startsWith('966')) {
    cleaned = '966' + cleaned;
  }
  
  return cleaned;
}
