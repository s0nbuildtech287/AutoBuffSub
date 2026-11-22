import { BaostarBalance, BaostarService, BaostarAddOrderResponse, BaostarOrderStatusResponse } from '@/types/smm';

const BAOSTAR_API_URL = process.env.BAOSTAR_API_URL || 'https://smm.baostar.net/api/v2';
const BAOSTAR_API_KEY = process.env.BAOSTAR_API_KEY || '';

class BaostarClient {
  private async post(payload: Record<string, any>) {
    if (!BAOSTAR_API_KEY) {
      return { error: 'API key chưa được cấu hình' };
    }

    try {
      const response = await fetch(BAOSTAR_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: BAOSTAR_API_KEY,
          ...payload,
        }),
        cache: 'no-store',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          error: data.error || data.message || `Máy chủ dịch vụ phản hồi mã lỗi: ${response.status}`,
          status: response.status,
          ...data,
        };
      }

      return data;
    } catch (err: any) {
      console.error('[BaostarClient] Network / Fetch error:', err);
      return {
        error: 'Không thể kết nối đến máy chủ dịch vụ',
      };
    }
  }

  async getBalance(): Promise<BaostarBalance> {
    return this.post({ action: 'balance' });
  }

  async getServices(): Promise<BaostarService[]> {
    return this.post({ action: 'services' });
  }

  async addOrder(serviceId: number, link: string, quantity: number): Promise<BaostarAddOrderResponse> {
    return this.post({
      action: 'add',
      service: serviceId,
      link: link.trim(),
      quantity: quantity,
    });
  }

  async getOrderStatus(orderId: number): Promise<BaostarOrderStatusResponse> {
    return this.post({
      action: 'status',
      order: orderId,
    });
  }

  async getMultipleStatus(orderIds: number[]): Promise<Record<string, BaostarOrderStatusResponse>> {
    return this.post({
      action: 'multiple_status',
      orders: orderIds.join(','),
    });
  }
}

export const baostarClient = new BaostarClient();

