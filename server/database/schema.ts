import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const sales = sqliteTable('sales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  itemDescription: text('item_description').notNull(),
  quantity: integer('quantity').notNull().default(1),
  price: real('price').notNull(),
  discount: real('discount').notNull().default(0),
  netAmount: real('net_amount').notNull(),
  paid: real('paid').notNull().default(0),
  remaining: real('remaining').notNull().default(0),
  warrantyDuration: text('warranty_duration').notNull(),
  warrantyExpiry: integer('warranty_expiry', { mode: 'timestamp' }),
  notes: text('notes'),
  saleDate: integer('sale_date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
