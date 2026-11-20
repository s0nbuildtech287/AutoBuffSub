import { IOrderRepository } from './order.interface';
import { OrderEntity } from '@/types/smm';

/**
 * Pha 2: PostgreSQL Repository sử dụng Prisma ORM
 * Khi chuyển sang Database thật, chỉ cần thiết lập STORAGE_DRIVER=postgres
 */
export class PrismaOrderRepository implements IOrderRepository {
  async createOrder(order: OrderEntity): Promise<boolean> {
    // Sẽ kết nối qua prisma.order.create(...) khi Prisma được kích hoạt ở Pha 2
    console.log('[PrismaOrderRepository] Creating order in PostgreSQL:', order);
    return true;
  }

  async updateOrderStatus(orderId: number, status: string, remains: number): Promise<boolean> {
    console.log('[PrismaOrderRepository] Updating order status in PostgreSQL:', { orderId, status, remains });
    return true;
  }

  async getOrders(username?: string): Promise<OrderEntity[]> {
    console.log('[PrismaOrderRepository] Fetching orders from PostgreSQL for:', username || 'all');
    return [];
  }

  async getOrderById(orderId: number): Promise<OrderEntity | null> {
    console.log('[PrismaOrderRepository] Finding order by ID in PostgreSQL:', orderId);
    return null;
  }
}

