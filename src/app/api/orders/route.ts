import { NextRequest, NextResponse } from 'next/server';
import { baostarClient } from '@/lib/baostar';
import { orderRepository } from '@/lib/repositories';
import { calculateOrderTotalCost } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, link, quantity } = body;

    const numServiceId = Number(serviceId);
    const numQuantity = parseInt(String(quantity), 10);

    if (!numServiceId || !link || !numQuantity || numQuantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Thông tin đặt đơn không hợp lệ. Vui lòng kiểm tra lại dịch vụ, link và số lượng.' },
        { status: 400 }
      );
    }

    // 1. Kiểm tra dịch vụ từ Baostar API để bảo mật và validate giá phía Server
    const services = await baostarClient.getServices();
    const targetService = Array.isArray(services) ? services.find((s) => s.service === numServiceId) : null;

    if (!targetService) {
      return NextResponse.json(
        { success: false, error: 'Mã dịch vụ không tồn tại trên hệ thống máy chủ.' },
        { status: 404 }
      );
    }

    // 2. Validate giới hạn số lượng min / max
    if (numQuantity < targetService.min || numQuantity > targetService.max) {
      return NextResponse.json(
        {
          success: false,
          error: `Số lượng đặt mua phải nằm trong khoảng từ ${targetService.min.toLocaleString('vi-VN')} đến ${targetService.max.toLocaleString('vi-VN')}.`,
        },
        { status: 400 }
      );
    }

    // 3. Tự tính toán chi phí chính xác ở Backend (Bao gồm 30% lợi nhuận, không tin dữ liệu gửi từ Client)
    const originalRateVndPer1k = targetService.vnd || Number(targetService.rate) * 27000;
    const verifiedCostVnd = calculateOrderTotalCost(originalRateVndPer1k, numQuantity);

    // 4. Gửi lệnh tạo đơn thực tế sang Baostar
    const baostarRes = await baostarClient.addOrder(numServiceId, link.trim(), numQuantity);

    if (baostarRes.error) {
      return NextResponse.json(
        { success: false, error: baostarRes.error },
        { status: 400 }
      );
    }

    if (!baostarRes.order) {
      return NextResponse.json(
        { success: false, error: 'Máy chủ Baostar không trả về mã đơn hàng hợp lệ.' },
        { status: 502 }
      );
    }

    // 5. Lưu vào kho lưu trữ (Google Sheet hoặc PostgreSQL)
    const orderData = {
      orderId: baostarRes.order,
      serviceId: numServiceId,
      serviceName: targetService.name,
      targetLink: link.trim(),
      quantity: numQuantity,
      costVnd: verifiedCostVnd,
      status: 'Pending',
      remains: numQuantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await orderRepository.createOrder(orderData);

    return NextResponse.json({
      success: true,
      message: 'Đặt đơn thành công!',
      orderId: baostarRes.order,
      data: orderData,
    });
  } catch (error: any) {
    console.error('[API /orders POST] Exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý đặt đơn từ hệ thống.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await orderRepository.getOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('[API /orders GET] Exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi tải lịch sử đơn hàng.' },
      { status: 500 }
    );
  }
}
