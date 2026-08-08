import { apiRequest } from "./client";

export interface DashboardSummary {
  total_customers: string;
  active_products: string;
  active_warehouses: string;
  confirmed_challans: string;
  total_sold_quantity: string;
  total_current_stock: string;
  low_stock_products: string;
  follow_ups_today: string;
}

export interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummary;
}

export const getDashboardSummary = () =>
  apiRequest<DashboardSummaryResponse>(
    "/dashboard/summary",
  );