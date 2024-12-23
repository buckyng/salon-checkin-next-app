import { Timestamp } from 'firebase/firestore';

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

export interface CheckInData {
  id?: string; // Unique identifier for the check-in record
  clientId: string; // ID of the client associated with the check-in
  clientName: string; // Name of the client (if available)
  checkInTime: string;
  date: string;
  isInService: boolean; // Current status of the check-in
  visitsBeforeToday?: number;
  lastVisitRating?: number | null;
}
