import { NextRequest, NextResponse } from 'next/server';
import { baostarClient } from '@/lib/baostar';
import { orderRepository } from '@/lib/repositories';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let orderIds: number[] = body.orderIds || [];

    // Nếu không truyền orderIds, lấy danh sách các đơn chưa hoàn thành từ repository
    if (orderIds.length === 0) {
      const orders = await orderRepository.getOrders();
      orderIds = orders
        .filter((o) => !['Completed', 'Canceled'].includes(o.status))
        .map((o) => Number(o.orderId))
        .filter(Boolean);
    }

    if (orderIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Không có đơn nào cần đồng bộ trạng thái.',
        updatedCount: 0,
      });
    }

    // Gọi API Baostar kiểm tra tiến độ
    let updatedCount = 0;
    if (orderIds.length === 1) {
      const statusRes = await baostarClient.getOrderStatus(orderIds[0]);
      if (statusRes.status) {
        await orderRepository.updateOrderStatus(
          orderIds[0],
          statusRes.status,
          Number(statusRes.remains || 0)
        );
        updatedCount++;
      }
    } else {
      const multiStatus = await baostarClient.getMultipleStatus(orderIds);
      for (const [idStr, statusInfo] of Object.entries(multiStatus)) {
        if (statusInfo && statusInfo.status) {
          await orderRepository.updateOrderStatus(
            Number(idStr),
            statusInfo.status,
            Number(statusInfo.remains || 0)
          );
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã đồng bộ trạng thái của ${updatedCount} đơn hàng.`,
      updatedCount,
    });
  } catch (error: any) {
    console.error('[API /orders/sync] Exception:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể đồng bộ trạng thái đơn hàng vào lúc này.' },
      { status: 500 }
    );
  }
}

