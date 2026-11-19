export interface BaostarService {
  service: number;
  name: string;
  type: string;
  rate: string;      // Rate in USD per 1000 items
  min: number;
  max: number;
  dripfeed?: number;
  average_time?: string | null;
  refill?: number;
  cancel?: number;
  notes?: string;
  vnd?: number;       // Rate in VND per 1000 items
  category: string;
}

export interface BaostarBalance {
  currency: string;
  balance: string;
  month?: number;
}

export interface BaostarAddOrderResponse {
  order?: number;
  error?: string;
}

export interface BaostarOrderStatusResponse {
  charge?: string;
  start_count?: string;
  status: string;    // 'Pending' | 'In progress' | 'Completed' | 'Partial' | 'Canceled'
  remains: string | number;
  currency?: string;
  error?: string;
}

export interface OrderEntity {
  id?: string;
  orderId: number;
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

