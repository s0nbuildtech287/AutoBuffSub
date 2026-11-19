import { BaostarBalance, BaostarService, BaostarAddOrderResponse, BaostarOrderStatusResponse } from '@/types/smm';

const BAOSTAR_API_URL = process.env.BAOSTAR_API_URL || 'https://smm.baostar.net/api/v2';
const BAOSTAR_API_KEY = process.env.BAOSTAR_API_KEY || '';

class BaostarClient {
  private async post(payload: Record<string, any>) {
    if (!BAOSTAR_API_KEY) {
      throw new Error('BAOSTAR_API_KEY is not configured in .env.local');
    }

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

    if (!response.ok) {
      throw new Error(`Baostar API HTTP error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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

