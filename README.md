# AutoBuffSub - Hệ Thống Auto Buff SMM Tự Động

Hệ thống web dashboard cá nhân giúp đặt đơn tương tác mạng xã hội (Facebook, TikTok, Instagram, YouTube, Telegram...) qua Baostar SMM API v2, lưu trữ và theo dõi tiến độ trên Google Sheets, sẵn sàng chuyển đổi sang PostgreSQL thông qua Repository Pattern.

---

## 🚀 Khởi chạy dự án (Local Development)

```bash
# 1. Cài đặt thư viện (nếu chưa cài)
npm install

# 2. Khởi chạy server phát triển
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:3000`

---

## ⚙️ Cấu hình Biến môi trường (`.env.local`)

```env
# API Key của Baostar
BAOSTAR_API_KEY=your-baostar-api-key
BAOSTAR_API_URL=https://smm.baostar.net/api/v2

# Storage Driver: 'sheets' (Pha 1) hoặc 'postgres' (Pha 2)
STORAGE_DRIVER=sheets

# URL Google Apps Script Webhook (sau khi Deploy dạng Web App)
GOOGLE_SHEET_WEBHOOK_URL=
```

---

## 📊 Hướng dẫn Tạo Google Sheet & Apps Script Webhook (Pha 1)

1. Tạo 1 Google Sheet mới trên Google Drive, đặt tên sheet là `Orders`.
2. Tạo các cột tiêu đề ở dòng 1:
   * **A:** `Created At`
   * **B:** `Order ID`
   * **C:** `Service ID`
   * **D:** `Service Name`
   * **E:** `Target Link`
   * **F:** `Quantity`
   * **G:** `Cost (VND)`
   * **H:** `Status`
   * **I:** `Remains`
   * **J:** `Updated At`
3. Vào menu **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.
4. Dán mã nguồn từ file `PLAN.md` (mục 3) vào, bấm Lưu (Ctrl+S).
5. Nhấn **Triển khai (Deploy)** ➔ **Triển khai mới (New deployment)**.
   * Chọn loại: **Ứng dụng web (Web App)**.
   * Thực thi dưới dạng: **Tôi (Me)**.
   * Quyền truy cập: **Bất kỳ ai (Anyone)**.
6. Copy URL nhận được và dán vào `GOOGLE_SHEET_WEBHOOK_URL` trong file `.env.local`.

---

## 🔄 Chuyển sang PostgreSQL (Pha 2)

Khi muốn bỏ Google Sheets:
1. Đổi `STORAGE_DRIVER=postgres` trong `.env.local`.
2. Cung cấp biến `DATABASE_URL=postgresql://...`.
3. Chạy `npx prisma db push` để tạo bảng PostgreSQL.
4. Chạy `npx ts-node scripts/migrate-sheets-to-db.ts` nếu muốn chuyển các đơn cũ từ Sheet sang Database.
