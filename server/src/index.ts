// src/server/index.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import salesRoutes from './routes/sales';

const app = express();
// استخدام parseInt لضمان أن المنفذ رقم صحيح
const port = parseInt(process.env.PORT || '10000', 10);

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// Logging middleware (تسجيل كل طلب يأتي للسيرفر)
app.use((req: any, res: any, next: any) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ---------- API ROUTES ----------
app.use('/api/sales', salesRoutes);

// 404 for unknown API routes (حماية ذكية للروابط الخطأ)
app.use('/api/*', (req: any, res: any) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// ---------- HEALTH CHECK ----------
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'OK', message: 'Bear Phone POS API is running' });
});

// ---------- FRONTEND INTEGRATION (SPA) ----------
// استخدام process.cwd() هو الحل الأمثل لمسارات Render
const distPath = path.join(process.cwd(), 'dist');
console.log('Serving frontend from:', distPath);

app.use(express.static(distPath));

// توجيه أي رابط ليس API إلى واجهة الموقع
app.get('*', (req: any, res: any) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Not Found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// ---------- ERROR HANDLING ----------
// معالجة الأخطاء بشكل كامل
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ---------- START SERVER ----------
app.listen(port, () => {
  console.log(`🐻 Bear Phone POS is running on port ${port}`);
});
