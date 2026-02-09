import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { join } from 'path';
import salesRoutes from './routes/sales';
import { initDatabase, testConnection } from '../database/db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files for assets
app.use('/assets', express.static(join(process.cwd(), 'public', 'assets')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/sales', salesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bear Phone POS API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Bear Phone POS API - دب فون',
    version: '1.0.0',
    endpoints: {
      sales: '/api/sales',
      dashboard: '/api/sales/stats/dashboard',
      health: '/health',
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database
    initDatabase();
    
    // Test database connection
    const dbConnected = testConnection();
    if (!dbConnected) {
      console.warn('⚠️ Starting server without database connection...');
    }

    app.listen(PORT, () => {
      console.log(`
🐻 =========================================
    BEAR PHONE POS - دب فون
    Server running on port ${PORT}
    API: http://localhost:${PORT}
=========================================
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
