
export type UserRole = 'admin' | 'employee';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface SalesRecord {
  date: string;
  quantity: number;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  current_quantity: number;
  min_required_quantity: number;
  price: number;
  sales_history: SalesRecord[];
  created_at: string;
  updated_at: string;
}

export interface AIInsights {
  restock_in_days: number;
  predicted_sales_next_month: number;
  low_stock_alert: boolean;
  explanation?: string;
}

export interface AppState {
  user: User | null;
  inventory: InventoryItem[];
}
