import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DB_DIR = join(process.cwd(), 'server', 'database');
const DB_PATH = join(DB_DIR, 'bearphone.db');

// Ensure database directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Initialize tables
export function initDatabase() {
  try {
    // Create sales table if not exists
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        item_description TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL,
        discount REAL NOT NULL DEFAULT 0,
        net_amount REAL NOT NULL,
        paid REAL NOT NULL DEFAULT 0,
        remaining REAL NOT NULL DEFAULT 0,
        warranty_duration TEXT NOT NULL,
        warranty_expiry INTEGER,
        notes TEXT,
        sale_date INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

export function testConnection() {
  try {
    const result = sqlite.prepare('SELECT 1').get();
    return result !== undefined;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
