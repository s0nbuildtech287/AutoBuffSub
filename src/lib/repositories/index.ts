import { IOrderRepository } from './order.interface';
import { GoogleSheetsOrderRepository } from './sheets-order.repository';
import { PrismaOrderRepository } from './prisma-order.repository';

/**
 * Storage Driver Factory:
 * - 'sheets' (Mặc định): Lưu vào Google Sheets qua Apps Script Webhook.
 * - 'postgres': Lưu vào PostgreSQL qua Prisma ORM.
 */
const storageDriver = process.env.STORAGE_DRIVER || 'sheets';

export const orderRepository: IOrderRepository =
  storageDriver === 'postgres'
    ? new PrismaOrderRepository()
    : new GoogleSheetsOrderRepository();

