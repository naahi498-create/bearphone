// Types for Bear Phone POS System

export interface Sale {
  id: number;
  customerName: string;
  phone: string;
  itemDescription: string;
  quantity: number;
  price: number;
  discount: number;
  netAmount: number;
  paid: number;
  remaining: number;
  warrantyDuration: WarrantyDuration;
  warrantyExpiry: Date | null;
  notes: string | null;
  saleDate: Date;
  createdAt: Date;
}

export type WarrantyDuration = 
  | 'بدون ضمان'
  | 'أسبوع واحد'
  | 'شهر واحد'
  | '3 أشهر'
  | '6 أشهر'
  | 'سنة واحدة'
  | 'سنتين';

export interface CreateSaleRequest {
  customerName: string;
  phone: string;
  itemDescription: string;
  quantity: number;
  price: number;
  discount: number;
  paid: number;
  warrantyDuration: WarrantyDuration;
  notes?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  activeWarranties: number;
  todaySales: number;
}

export interface WarrantyOption {
  value: WarrantyDuration;
  label: string;
  days: number;
}

export const WARRANTY_OPTIONS: WarrantyOption[] = [
  { value: 'بدون ضمان', label: 'بدون ضمان', days: 0 },
  { value: 'أسبوع واحد', label: 'أسبوع واحد', days: 7 },
  { value: 'شهر واحد', label: 'شهر واحد', days: 30 },
  { value: '3 أشهر', label: '3 أشهر', days: 90 },
  { value: '6 أشهر', label: '6 أشهر', days: 180 },
  { value: 'سنة واحدة', label: 'سنة واحدة', days: 365 },
  { value: 'سنتين', label: 'سنتين', days: 730 },
];

export function calculateWarrantyExpiry(saleDate: Date, warrantyDuration: WarrantyDuration): Date | null {
  const option = WARRANTY_OPTIONS.find(opt => opt.value === warrantyDuration);
  if (!option || option.days === 0) return null;
  
  const expiry = new Date(saleDate);
  expiry.setDate(expiry.getDate() + option.days);
  return expiry;
}
