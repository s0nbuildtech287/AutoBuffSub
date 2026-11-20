import { OrderEntity } from '@/types/smm';

export interface IOrderRepository {
  /**
   * Tạo bản ghi đơn hàng mới vào kho lưu trữ (Google Sheet hoặc Database)
   */
  createOrder(order: OrderEntity): Promise<boolean>;

  /**
   * Cập nhật trạng thái và số lượng còn thiếu của đơn hàng
   */
  updateOrderStatus(orderId: number, status: string, remains: number): Promise<boolean>;

  /**
   * Lấy danh sách đơn hàng đã đặt (tùy chọn lọc theo username)
   */
  getOrders(username?: string): Promise<OrderEntity[]>;

  /**
   * Tìm đơn hàng theo Order ID từ Baostar
   */
  getOrderById(orderId: number): Promise<OrderEntity | null>;
}

