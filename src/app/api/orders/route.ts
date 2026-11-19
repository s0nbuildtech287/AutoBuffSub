import { NextRequest, NextResponse } from 'next/server';
import { baostarClient } from '@/lib/baostar';
import { orderRepository } from '@/lib/repositories';
import { calculateOrderTotalCost } from '@/lib/pricing';
import { deductBalanceOnSheet, refundBalanceOnSheet } from '@/lib/sheetsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, link, quantity, username } = body;

    const numServiceId = Number(serviceId);
    const numQuantity = parseInt(String(quantity), 10);
    const cleanUsername = String(username || '').trim();

    // 1. Kiểm tra tài khoản người dùng
    if (!cleanUsername) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập tài khoản trước khi tạo đơn dịch vụ.' },
        { status: 401 }
      );
    }

    if (!numServiceId || !link || !numQuantity || numQuantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Thông tin đặt đơn không hợp lệ. Vui lòng kiểm tra lại dịch vụ, link và số lượng.' },
        { status: 400 }
      );
    }

    // 2. Kiểm tra dịch vụ từ Baostar API để bảo mật và validate giá phía Server
    const services = await baostarClient.getServices();
    const targetService = Array.isArray(services) ? services.find((s) => s.service === numServiceId) : null;

    if (!targetService) {
      return NextResponse.json(
        { success: false, error: 'Mã dịch vụ không tồn tại trên hệ thống máy chủ.' },
        { status: 404 }
      );
    }

    // 3. Validate giới hạn số lượng min / max
    if (numQuantity < targetService.min || numQuantity > targetService.max) {
      return NextResponse.json(
        {
          success: false,
          error: `Số lượng đặt mua phải nằm trong khoảng từ ${targetService.min.toLocaleString('vi-VN')} đến ${targetService.max.toLocaleString('vi-VN')}.`,
        },
        { status: 400 }
      );
    }

    // 4. Tự tính toán chi phí chính xác ở Backend (Bao gồm 30% lợi nhuận, không tin dữ liệu gửi từ Client)
    const originalRateVndPer1k = targetService.vnd || Number(targetService.rate) * 27000;
    const verifiedCostVnd = calculateOrderTotalCost(originalRateVndPer1k, numQuantity);

    // 5. BẢO MẬT TÀI CHÍNH: KIỂM TRA & TRỪ TIỀN THỰC TẾ TRÊN DATABASE (GOOGLE SHEET) TRƯỚC
    const deductResult = await deductBalanceOnSheet(cleanUsername, verifiedCostVnd);

    if (!deductResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: deductResult.error || 'Số dư không đủ để thanh toán đơn hàng này. Vui lòng nạp thêm tiền!',
        },
        { status: 400 }
      );
    }

    // 6. Sau khi đã trừ tiền thành công, gửi lệnh tạo đơn thực tế sang Baostar
    const baostarRes = await baostarClient.addOrder(numServiceId, link.trim(), numQuantity);

    // Nếu Baostar gặp lỗi, HOÀN TIỀN NGAY LẬP TỨC cho người dùng
    if (baostarRes.error || !baostarRes.order) {
      const errorMsg = baostarRes.error || 'Máy chủ Baostar không phản hồi đơn hàng hợp lệ.';
      console.warn(`[API /orders] Baostar order failed: ${errorMsg}. Refunding ${verifiedCostVnd} to ${cleanUsername}`);
      
      await refundBalanceOnSheet(cleanUsername, verifiedCostVnd, `Baostar API Error: ${errorMsg}`);

      return NextResponse.json(
        {
          success: false,
          error: `Đơn hàng thất bại từ nhà cung cấp (${errorMsg}). Số tiền ${verifiedCostVnd.toLocaleString('vi-VN')}đ đã được tự động hoàn lại vào tài khoản của bạn.`,
        },
        { status: 400 }
      );
    }

    // 7. Lưu vào kho lưu trữ (Google Sheet tab DonHang)
    const orderData = {
      orderId: baostarRes.order,
      serviceId: numServiceId,
      serviceName: targetService.name,
      targetLink: link.trim(),
      quantity: numQuantity,
      costVnd: verifiedCostVnd,
      status: 'Pending',
      remains: numQuantity,
      username: cleanUsername,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await orderRepository.createOrder(orderData);

    return NextResponse.json({
      success: true,
      message: 'Đặt đơn thành công!',
      orderId: baostarRes.order,
      newBalance: deductResult.newBalance,
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
      { success: false, error: error.message || 'Lỗi lấy danh sách đơn hàng.' },
      { status: 500 }
    );
  }
}
