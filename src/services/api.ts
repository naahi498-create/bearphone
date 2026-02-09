import type { Sale, CreateSaleRequest, DashboardStats, ApiResponse } from '@/types';

// أولًا، استخدم متغير البيئة إن وُجد، وإلا استخدم الرابط الحي للنشر
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://bearphone.onrender.com/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      // محاولة قراءة البيانات
      let data: any;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // التحقق من نجاح الاستجابة
      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'فشل الاتصال بالسيرفر',
      };
    }
  }

  // =================== Sales API ===================
  async createSale(sale: CreateSaleRequest): Promise<ApiResponse<Sale>> {
    return this.request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  async getSales(): Promise<ApiResponse<Sale[]>> {
    return this.request<Sale[]>('/sales');
  }

  async getSaleById(id: number): Promise<ApiResponse<Sale>> {
    return this.request<Sale>(`/sales/${id}`);
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/sales/stats/dashboard');
  }

  getInvoicePdfUrl(id: number): string {
    return `${API_BASE_URL}/sales/${id}/pdf`;
  }
}

export const api = new ApiService();