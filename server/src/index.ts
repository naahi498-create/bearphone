// src/server/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import salesRoutes from './routes/sales';

const app = express();
const port: number = parseInt(process.env.PORT || '10000', 10);

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ---------- API ROUTES ----------
app.use('/api/sales', salesRoutes);

// 404 for unknown API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// ---------- HEALTH CHECK ----------
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Bear Phone POS API is running' });
});

// ---------- FRONTEND INTEGRATION (SPA) ----------
const distPath = path.join(process.cwd(), 'dist');
console.log('Serving frontend from:', distPath);

app.use(express.static(distPath));

// Route all non-API requests to index.html (for SPA)
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Not Found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// ---------- ERROR HANDLING ----------
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err.message, err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ---------- START SERVER ----------
app.listen(port, () => {
  console.log(`🐻 Bear Phone POS is running on port ${port}`);
});
