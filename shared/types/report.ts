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

export interface EmployeeReport {
  date: string; // The date of the report in 'yyyy-MM-dd' format
  totalSales: number; // The total sales amount for the specified date
  sales?: SaleData[]; // Optional: An array of detailed sales for the date
}

export interface salesOfEmployeeEndOfDay {
  id: string;
  amount: number;
  createdAt: string;
  comboNum?: number;
  note?: string | null;
}

export interface OwnerReport {
  date: string; // The date for the report in 'YYYY-MM-DD' format
  totalSales: number; // Total sales for the organization on that date
  employeeSummaries: {
    employeeId: string;
    employeeName: string;
    totalSale: number;
    sales: salesOfEmployeeEndOfDay[];
  }[];
}

export interface DetailsReportAllEmployees {
  employeeId: string;
  employeeName: string;
  totalSale: number;
  sales: {
    id: string;
    amount: number;
    createdAt: string;
    comboNum?: number;
    note?: string | null;
  }[];
}
