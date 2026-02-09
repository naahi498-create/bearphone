import type { Sale, CreateSaleRequest, DashboardStats, ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في الاتصال');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      };
    }
  }

  // Sales API
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
