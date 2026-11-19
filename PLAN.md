# KẾ HOẠCH PHÁT TRIỂN HỆ THỐNG AUTO BUFF SMM PANEL (AutoBuffSub)

> **Mục tiêu:** Xây dựng hệ thống web cá nhân để quản lý, đặt đơn tự động và theo dõi tiến độ buff tương tác mạng xã hội qua Baostar SMM API, lưu trữ trên Google Sheets (Pha 1), và **thiết kế kiến trúc trừu tượng (Adapter Pattern) để chuyển đổi mượt mà sang Backend PostgreSQL + Redis mà không cần đập đi viết lại** (Pha 2).

---

## 1. Kiến trúc Hệ thống & Lộ trình Tiến hóa (Architecture Roadmap)

```
[Client / UI: Next.js 15]
           │
           ▼
[Service Layer: OrderService & BaostarClient]
           │
           ▼
┌────────────────────────────────────────────────────────┐
│             INTERFACE: IOrderRepository                │
│    (create, updateStatus, getOrders, getOrderById)     │
└────────────────────────────────────────────────────────┘
           │                                  │
           ▼ (Pha 1: Hiện tại)                ▼ (Pha 2: Tương lai)
┌───────────────────────────────┐  ┌───────────────────────────────────┐
│ GoogleSheetsOrderRepository   │  │ PrismaPostgresOrderRepository     │
│ ├── Gọi Apps Script Webhook   │  │ ├── PostgreSQL (Lưu dữ liệu ACID) │
│ └── Ghi vào Google Sheet      │  │ ├── Redis + BullMQ (Xử lý Queue)  │
│                               │  │ └── PayOS (Nạp tiền tự động)      │
└───────────────────────────────┘  └───────────────────────────────────┘
```

---

## 2. Thiết kế Cơ sở Dữ liệu Google Sheets (Pha 1)

File Google Sheet (tên: `AutoBuff_Database`) gồm trang tính chính: **`Orders`**

### Cấu trúc các cột tiêu đề (Row 1):
| Cột | Tên trường | Kiểu dữ liệu | Ví dụ | Mô tả |
| :---: | :--- | :--- | :--- | :--- |
| **A** | `Created At` | Datetime | `2026-11-16 15:30:00` | Thời điểm tạo đơn |
| **B** | `Order ID` | Number | `129845` | Mã đơn trả về từ Baostar |
| **C** | `Service ID` | Number | `6431` | ID dịch vụ |
| **D** | `Service Name` | Text | `S3 - clone TÂY - siêu rẻ` | Tên dịch vụ |
| **E** | `Target Link` | Text (URL) | `https://facebook.com/...` | Link bài viết/trang/video |
| **F** | `Quantity` | Number | `1000` | Số lượng mua |
| **G** | `Cost (VND)` | Number | `6530` | Tổng chi phí |
| **H** | `Status` | Text | `Pending` / `In progress` / `Completed` / `Canceled` | Trạng thái đơn |
| **I** | `Remains` | Number | `0` | Số lượng còn thiếu |
| **J** | `Updated At` | Datetime | `2026-11-16 15:45:00` | Lần cuối cập nhật trạng thái |

---

## 3. Mã Nguồn Google Apps Script (Pha 1)

Mã kịch bản Google Apps Script dán vào Google Sheet để nhận dữ liệu từ Web:

```javascript
/**
 * Google Apps Script Webhook cho AutoBuffSub
 * Triển khai dưới dạng Web App (Execute as: Me, Who has access: Anyone)
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const action = data.action;

    // 1. Ghi nhận đơn hàng mới
    if (action === "ADD_ORDER") {
      sheet.appendRow([
        new Date().toLocaleString("vi-VN"),
        data.orderId,
        data.serviceId,
        data.serviceName,
        data.targetLink,
        data.quantity,
        data.costVnd,
        data.status || "Pending",
        data.remains || data.quantity,
        new Date().toLocaleString("vi-VN")
      ]);
      return responseJSON({ success: true, message: "Order logged successfully" });
    }

    // 2. Cập nhật trạng thái đơn hàng theo Order ID
    if (action === "UPDATE_STATUS") {
      const rows = sheet.getDataRange().getValues();
      let updated = false;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] == data.orderId) { // Cột B là Order ID
          sheet.getRange(i + 1, 8).setValue(data.status); // Cột H: Status
          sheet.getRange(i + 1, 9).setValue(data.remains); // Cột I: Remains
          sheet.getRange(i + 1, 10).setValue(new Date().toLocaleString("vi-VN")); // Cột J: Updated At
          updated = true;
          break;
        }
      }
      return responseJSON({ success: updated, message: updated ? "Updated" : "Order not found" });
    }

    return responseJSON({ success: false, message: "Unknown action" });
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return responseJSON({ success: true, data: [] });

    const orders = [];
    for (let i = 1; i < rows.length; i++) {
      orders.push({
        createdAt: rows[i][0],
        orderId: rows[i][1],
        serviceId: rows[i][2],
        serviceName: rows[i][3],
        targetLink: rows[i][4],
        quantity: rows[i][5],
        costVnd: rows[i][6],
        status: rows[i][7],
        remains: rows[i][8],
        updatedAt: rows[i][9],
      });
    }
    return responseJSON({ success: true, data: orders.reverse() }); // Mới nhất lên đầu
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  }
}

function responseJSON(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 4. CHI TIẾT THIẾT KẾ BACKEND CHUYỂN ĐỔI (Storage Adapter Pattern)

Để đảm bảo sau này **bỏ Google Sheets chuyển sang PostgreSQL mà không phải sửa code nghiệp vụ hay giao diện**, Backend sẽ được tổ chức theo **Repository Pattern**:

### 4.1. Khai báo Interface chuẩn (`src/lib/repositories/order.interface.ts`)
```typescript
export interface OrderEntity {
  id?: string;
  orderId: number;           // ID từ Baostar
  serviceId: number;
  serviceName: string;
  targetLink: string;
  quantity: number;
  costVnd: number;
  status: string;
  remains: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOrderRepository {
  createOrder(order: OrderEntity): Promise<boolean>;
  updateOrderStatus(orderId: number, status: string, remains: number): Promise<boolean>;
  getOrders(): Promise<OrderEntity[]>;
  getOrderById(orderId: number): Promise<OrderEntity | null>;
}
```

### 4.2. Triển khai Adapter Pha 1: Google Sheets (`src/lib/repositories/sheets-order.repository.ts`)
```typescript
import { IOrderRepository, OrderEntity } from './order.interface';

export class GoogleSheetsOrderRepository implements IOrderRepository {
  private webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL!;

  async createOrder(order: OrderEntity): Promise<boolean> {
    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'ADD_ORDER', ...order }),
    });
    const data = await res.json();
    return data.success;
  }

  async updateOrderStatus(orderId: number, status: string, remains: number): Promise<boolean> {
    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'UPDATE_STATUS', orderId, status, remains }),
    });
    const data = await res.json();
    return data.success;
  }

  async getOrders(): Promise<OrderEntity[]> {
    const res = await fetch(this.webhookUrl, { method: 'GET', cache: 'no-store' });
    const json = await res.json();
    return json.data || [];
  }

  async getOrderById(orderId: number): Promise<OrderEntity | null> {
    const orders = await this.getOrders();
    return orders.find(o => o.orderId === orderId) || null;
  }
}
```

### 4.3. Triển khai Adapter Pha 2: PostgreSQL + Prisma (`src/lib/repositories/prisma-order.repository.ts`)
Khi chuyển sang Database thật, chỉ cần viết thêm class này:
```typescript
import { IOrderRepository, OrderEntity } from './order.interface';
import { prisma } from '../prisma'; // Prisma Client kết nối PostgreSQL

export class PrismaOrderRepository implements IOrderRepository {
  async createOrder(order: OrderEntity): Promise<boolean> {
    await prisma.order.create({
      data: {
        orderId: order.orderId,
        serviceId: order.serviceId,
        serviceName: order.serviceName,
        targetLink: order.targetLink,
        quantity: order.quantity,
        costVnd: order.costVnd,
        status: order.status,
        remains: order.remains,
      }
    });
    return true;
  }

  async updateOrderStatus(orderId: number, status: string, remains: number): Promise<boolean> {
    await prisma.order.updateMany({
      where: { orderId },
      data: { status, remains, updatedAt: new Date() }
    });
    return true;
  }

  async getOrders(): Promise<OrderEntity[]> {
    return await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getOrderById(orderId: number): Promise<OrderEntity | null> {
    return await prisma.order.findFirst({ where: { orderId } });
  }
}
```

### 4.4. Cơ chế chuyển đổi bằng 1 dòng Config (Dependency Injection Factory)
Trong file `src/lib/repositories/index.ts`:
```typescript
import { IOrderRepository } from './order.interface';
import { GoogleSheetsOrderRepository } from './sheets-order.repository';
import { PrismaOrderRepository } from './prisma-order.repository';

// Chọn kho lưu trữ thông qua biến môi trường:
export const orderRepository: IOrderRepository =
  process.env.STORAGE_DRIVER === 'postgres'
    ? new PrismaOrderRepository()
    : new GoogleSheetsOrderRepository();
```
> **Lợi ích:** Khi muốn bỏ Google Sheets, bạn chỉ cần cấu hình `STORAGE_DRIVER=postgres` trong `.env`. Toàn bộ code API route, logic nghiệp vụ và giao diện giữ nguyên 100%.

---

## 5. Thiết kế Schema Database khi lên Pha 2 (Prisma PostgreSQL)

Khi chuyển sang PostgreSQL, file `prisma/schema.prisma` được chuẩn bị sẵn:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Bảng đơn hàng (tương ứng trực tiếp với 10 cột trong Google Sheet)
model Order {
  id          String   @id @default(uuid())
  orderId     Int      @unique @map("order_id") // ID từ Baostar
  serviceId   Int      @map("service_id")
  serviceName String   @map("service_name")
  targetLink  String   @map("target_link")
  quantity    Int
  costVnd     Decimal  @map("cost_vnd") @db.Decimal(12, 2)
  status      String   @default("Pending")
  remains     Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Quan hệ khi mở rộng đa người dùng (Pha 2)
  userId      String?  @map("user_id")
  user        User?    @relation(fields: [userId], references: [id])

  @@map("orders")
}

// Bảng người dùng & số dư (Pha 2)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  balance   Decimal  @default(0) @db.Decimal(12, 2)
  role      String   @default("USER") // USER | ADMIN
  orders    Order[]
  transactions Transaction[]
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}

// Bảng biến động số dư / nạp tiền VietQR (Pha 2)
model Transaction {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id])
  amount      Decimal  @db.Decimal(12, 2)
  type        String   // TOPUP | PURCHASE | REFUND
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("transactions")
}
```

---

## 6. Công cụ Di chuyển Dữ liệu (Migration Script từ Sheets -> Postgres)

Khi anh sẵn sàng bỏ Google Sheets, một script nhỏ (`scripts/migrate-sheets-to-db.ts`) sẽ đọc toàn bộ các dòng hiện có trên Google Sheet và tự động `INSERT` vào PostgreSQL:

```typescript
// scripts/migrate-sheets-to-db.ts
import { GoogleSheetsOrderRepository } from '../src/lib/repositories/sheets-order.repository';
import { PrismaOrderRepository } from '../src/lib/repositories/prisma-order.repository';

async function migrate() {
  console.log("Đang đọc dữ liệu từ Google Sheets...");
  const sheetRepo = new GoogleSheetsOrderRepository();
  const dbRepo = new PrismaOrderRepository();

  const orders = await sheetRepo.getOrders();
  console.log(`Tìm thấy ${orders.length} đơn hàng trên Google Sheet.`);

  for (const order of orders) {
    await dbRepo.createOrder(order);
    console.log(`Đã chuyển đơn: #${order.orderId}`);
  }
  console.log("Di chuyển dữ liệu thành công 100%!");
}

migrate();
```

---

## 7. Cấu trúc Dự án Web Tổng Thể

Thư mục dự án đặt tại: `C:\Users\XUAN SON\Desktop\Xuan Son Version\AutoBuffSub`

```
AutoBuffSub/
├── prisma/
│   └── schema.prisma                   # Schema PostgreSQL sẵn sàng cho Pha 2
├── scripts/
│   └── migrate-sheets-to-db.ts         # Script chuyển data từ Sheet sang DB
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── balance/route.ts        # GET: Lấy số dư ví Baostar
│   │   │   ├── services/route.ts       # GET: Lấy 236 dịch vụ
│   │   │   ├── orders/
│   │   │   │   ├── route.ts            # POST: Tạo đơn (gọi Baostar + lưu Repo)
│   │   │   │   └── list/route.ts       # GET: Lấy danh sách lịch sử từ Repo
│   │   │   └── sync-status/route.ts    # POST: Kiểm tra và cập nhật tiến độ đơn
│   │   ├── layout.tsx
│   │   └── page.tsx                    # Trang Dashboard chính (UI)
│   ├── components/
│   │   ├── BalanceCard.tsx             # Widget hiển thị số dư ví
│   │   ├── CreateOrderForm.tsx         # Form chọn dịch vụ, nhập link, số lượng
│   │   └── OrderHistoryTable.tsx       # Bảng lịch sử đơn hàng
│   ├── lib/
│   │   ├── baostar.ts                  # Client SDK giao tiếp với Baostar API
│   │   └── repositories/               # Kiến trúc Storage Adapter Pattern
│   │       ├── order.interface.ts      # IOrderRepository chung
│   │       ├── sheets-order.repository.ts  # Adapter Google Sheets (Pha 1)
│   │       ├── prisma-order.repository.ts  # Adapter PostgreSQL (Pha 2)
│   │       └── index.ts                # Factory chuyển đổi qua STORAGE_DRIVER
│   └── types/
│       └── smm.ts                      # TypeScript Interfaces
├── .env.local                          # Biến môi trường
├── package.json
└── README.md
```

---

## 8. Kế hoạch Các Bước Triển Khai (Action Checklist)

- [ ] **Bước 1: Setup Google Sheet & Webhook (Pha 1)**
  - Tạo trang tính `AutoBuff_Database`.
  - Tạo kịch bản Apps Script, dán code ở mục 3 và nhấn Deploy -> Lấy Webhook URL.
- [ ] **Bước 2: Khởi tạo mã nguồn Next.js 15**
  - Chạy `npx create-next-app@latest .` bên trong thư mục `AutoBuffSub` (App Router, Tailwind CSS, TypeScript).
- [ ] **Bước 3: Thiết lập biến môi trường (`.env.local`)**
  - `BAOSTAR_API_KEY=your-baostar-api-key`
  - `BAOSTAR_API_URL=https://smm.baostar.net/api/v2`
  - `GOOGLE_SHEET_WEBHOOK_URL=<URL_APPS_SCRIPT>`
  - `STORAGE_DRIVER=sheets` (Sau này đổi thành `postgres` khi lên Pha 2)
- [ ] **Bước 4: Cài đặt Storage Adapter Layer**
  - Viết Interface `IOrderRepository` và class `GoogleSheetsOrderRepository`.
  - Chuẩn bị sẵn file `schema.prisma` và `PrismaOrderRepository` để sẵn sàng cho Pha 2.
- [ ] **Bước 5: Xây dựng Backend API Routes & Baostar Client**
  - Viết `src/lib/baostar.ts` (các hàm: `getBalance`, `getServices`, `addOrder`, `getOrderStatus`).
  - Viết các API Routes trong `src/app/api/...`.
- [ ] **Bước 6: Xây dựng Frontend UI**
  - Xây dựng form chọn dịch vụ với tìm kiếm bộ lọc danh mục.
  - Xây dựng bảng theo dõi lịch sử với badge trạng thái (`Completed`, `In progress`, `Canceled`).
- [ ] **Bước 7: Chạy thử nghiệm cục bộ & Deploy Vercel**
