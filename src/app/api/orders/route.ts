import { NextRequest, NextResponse } from 'next/server';
import { baostarClient } from '@/lib/baostar';
import { orderRepository } from '@/lib/repositories';
import { calculateOrderTotalCost } from '@/lib/pricing';
import { deductBalanceOnSheet, refundBalanceOnSheet } from '@/lib/sheetsService';

export async function POST(req: NextRequest) {
  let isDeducted = false;
  let cleanUsername = '';
  let verifiedCostVnd = 0;

  try {
    const body = await req.json();
    const { serviceId, link, quantity, username } = body;

    const numServiceId = Number(serviceId);
    const numQuantity = parseInt(String(quantity), 10);
    cleanUsername = String(username || '').trim();

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
    verifiedCostVnd = calculateOrderTotalCost(originalRateVndPer1k, numQuantity);

    // 4.1 BẢO VỆ TÀI CHÍNH: KIỂM TRA SỐ DƯ TÀI KHOẢN NGUỒN TRƯỚC KHI TRỪ TIỀN KHÁCH
    const originalRateUsd = Number(targetService.rate || 0);
    const requiredUsd = (originalRateUsd * numQuantity) / 1000;

    try {
      const upstreamBal = await baostarClient.getBalance();
      const currentUsd = Number(upstreamBal?.balance || 0);

      // Nếu ví nguồn không đủ tiền để chạy đơn này -> DỪNG NGAY, TUYỆT ĐỐI KHÔNG TRỪ TIỀN KHÁCH!
      if (currentUsd < requiredUsd) {
        console.warn(`[API /orders] Cổng nguồn không đủ số dư. Hiện có: $${currentUsd}, cần: $${requiredUsd}`);
        return NextResponse.json(
          {
            success: false,
            error: 'Máy chủ dịch vụ này hiện đang tạm thời bảo trì hoặc đạt giới hạn số lượng trong ngày. Vui lòng thử lại sau ít phút hoặc chọn máy chủ khác!',
          },
          { status: 400 }
        );
      }
    } catch (balErr) {
      console.warn('[API /orders] Không thể xác thực số dư nguồn trước:', balErr);
    }

    // 5. BẢO MẬT TÀI CHÍNH: KIỂM TRA & TRỪ TIỀN THỰC TẾ TRÊN DATABASE (GOOGLE SHEET)
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
    isDeducted = true;

    // 6. Sau khi đã trừ tiền thành công, gửi lệnh tạo đơn thực tế sang Baostar
    const baostarRes = await baostarClient.addOrder(numServiceId, link.trim(), numQuantity);

    // Nếu gặp lỗi từ đối tác, HOÀN TIỀN NGAY LẬP TỨC cho người dùng
    if (baostarRes.error || !baostarRes.order) {
      const rawError = baostarRes.error || 'Máy chủ hệ thống không phản hồi đơn hàng hợp lệ.';
      let sanitizedError = String(rawError)
        .replace(/baostar(\.net)?/gi, 'máy chủ')
        .replace(/smm/gi, 'dịch vụ');

      // Nếu lỗi do hết tiền nguồn -> ẩn giấu tế nhị
      if (/số dư không đủ|not enough funds|balance/i.test(rawError)) {
        sanitizedError = 'máy chủ đạt giới hạn số lượng trong ngày';
      }

      console.warn(`[API /orders] Order failed: ${sanitizedError}. Refunding ${verifiedCostVnd} to ${cleanUsername}`);
      
      await refundBalanceOnSheet(cleanUsername, verifiedCostVnd, `Order Error: ${sanitizedError}`);
      isDeducted = false;

      return NextResponse.json(
        {
          success: false,
          error: `Đơn hàng tạm thời chưa thể khởi tạo (${sanitizedError}). Số tiền ${verifiedCostVnd.toLocaleString('vi-VN')}đ đã được tự động hoàn lại vào ví của bạn.`,
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

    // Cơ chế khẩn cấp: Nếu đã lỡ trừ tiền mà bị lỗi bất ngờ -> Tự động hoàn tiền ngay
    if (isDeducted && cleanUsername && verifiedCostVnd > 0) {
      console.warn(`[API /orders POST] Emergency refunding ${verifiedCostVnd} to ${cleanUsername}`);
      try {
        await refundBalanceOnSheet(cleanUsername, verifiedCostVnd, 'Hệ thống ngoại lệ, tự động hoàn tiền');
      } catch (refErr) {
        console.error('[API /orders POST] Emergency refund error:', refErr);
      }
    }

    return NextResponse.json(
      { success: false, error: 'Lỗi xử lý đặt đơn từ hệ thống. Nếu có trừ tiền, số tiền đã được hoàn lại.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    // Bảo mật: Nếu chưa đăng nhập hoặc không truyền username, không hiển thị đơn của ai khác
    if (!username || !username.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    const cleanUsername = username.trim().toLowerCase();
    const orders = await orderRepository.getOrders(cleanUsername);

    // Lọc bảo mật 2 lớp: Chỉ trả về đúng đơn hàng của tài khoản đang đăng nhập
    const userOrders = orders.filter(
      (o) => (o.username || '').toLowerCase() === cleanUsername
    );

    return NextResponse.json({ success: true, data: userOrders });
  } catch (error: any) {
    console.error('[API /orders GET] Exception:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi lấy danh sách đơn hàng.' },
      { status: 500 }
    );
  }
}
