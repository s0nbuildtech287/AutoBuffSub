import { IOrderRepository } from './order.interface';
import { OrderEntity } from '@/types/smm';

export class GoogleSheetsOrderRepository implements IOrderRepository {
  private get webhookUrl(): string {
    return (
      process.env.GOOGLE_SHEET_WEBHOOK_URL ||
      'https://script.google.com/macros/s/AKfycbwY_50mEAFv6Kx9jPPbpaV9_3RJYMLBLYbZKohYl4yJSFdMqrdUJaBWp4KeoDsSpQxlUA/exec'
    );
  }

  async createOrder(order: OrderEntity): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn('[GoogleSheetsOrderRepository] GOOGLE_SHEET_WEBHOOK_URL not configured. Order not logged to sheet.');
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_ORDER',
          ...order,
        }),
      });

      const data = await response.json();
      return !!data.success;
    } catch (error) {
      console.error('[GoogleSheetsOrderRepository] Error writing order to sheet:', error);
      return false;
    }
  }

  async updateOrderStatus(orderId: number, status: string, remains: number): Promise<boolean> {
    if (!this.webhookUrl) return false;

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          orderId,
          status,
          remains,
        }),
      });

      const data = await response.json();
      return !!data.success;
    } catch (error) {
      console.error('[GoogleSheetsOrderRepository] Error updating status in sheet:', error);
      return false;
    }
  }

  async getOrders(username?: string): Promise<OrderEntity[]> {
    if (!this.webhookUrl) return [];

    try {
      const url = username
        ? `${this.webhookUrl}?action=GET_ORDERS&username=${encodeURIComponent(username.trim())}`
        : this.webhookUrl;

      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
      });

      const data = await response.json();
      const allOrders: OrderEntity[] = data.data || [];

      // Lọc bảo mật tại chỗ theo username nếu có
      if (username && username.trim()) {
        const cleanUser = username.trim().toLowerCase();
        return allOrders.filter(
          (o) => (o.username || '').toLowerCase() === cleanUser
        );
      }

      return allOrders;
    } catch (error) {
      console.error('[GoogleSheetsOrderRepository] Error fetching orders from sheet:', error);
      return [];
    }
  }

  async getOrderById(orderId: number): Promise<OrderEntity | null> {
    const orders = await this.getOrders();
    return orders.find((o) => Number(o.orderId) === Number(orderId)) || null;
  }
}

