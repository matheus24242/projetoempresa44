export type SaleChannel = 'shopee' | 'personal';

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  user_id?: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  totalPrice: number;
  channel: SaleChannel;
  timestamp: string;
  customerName?: string;
  user_id?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  shopeeRevenue: number;
  personalRevenue: number;
  totalSales: number;
}
