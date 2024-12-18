import { SaleData } from './transaction';

export interface EndOfDayReport {
  organizationId: string;
  date: string; // e.g., '2024-12-16'
  cash: number;
  debit: number;
  serviceDiscount: number;
  giftcardBuy: number;
  giftcardRedeem: number;
  otherIncome: number;
  incomeNote?: string;
  expense: number;
  expenseNote?: string;
  totalSale: number;
  employeeSummaries: EmployeeSummary[];
  result: number;
  createdAt: string; // ISO string for the submission time
}

export interface EmployeeSummary {
  employeeId: string;
  employeeName: string;
  totalSale: number;
  sales: SaleData[]; // Array of sales
}

export interface EmployeeSales {
  total: number;
  sales: SaleData[]; // Assuming SaleData is already defined
}