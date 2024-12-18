export interface SaleData {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeName?: string;
  amount: number;
  comboNum?: number;
  note?: string | null;
  createdAt: string;
  paid?: boolean;
}

export type NewSaleData = Omit<SaleData, 'id'>; // Excludes 'id' for creating new sales
