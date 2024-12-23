'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOrganizationSales } from '@shared/services/saleService';
import { saveEndOfDayReport } from '@shared/services/reportService';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { fetchUserRoles } from '@shared/services/organizationService';
import { withAuth } from '@shared/components/hoc/withAuth';
import { useOrganization } from '@/app/hooks/useOrganization';
import { Label } from '@shared/components/ui/label';
import { EmployeeSales, EmployeeSummary } from '@shared/types/report';
import { fetchEmployeeNames } from '@shared/services/userService';

interface PageProps {
  params: Promise<{ organizationId: string }>;
}

const ReportCashierPage = ({ params }: PageProps) => {
  const router = useRouter();
  const { organizationId } = useOrganization(use(params).organizationId);
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  const [cash, setCash] = useState('');
  const [debit, setDebit] = useState('');
  const [serviceDiscount, setServiceDiscount] = useState('');
  const [giftcardBuy, setGiftcardBuy] = useState('');
  const [giftcardRedeem, setGiftcardRedeem] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [incomeNote, setIncomeNote] = useState('');
  const [expense, setExpense] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [totalSale, setTotalSale] = useState<number>(0);
  const [resultCheck, setResultCheck] = useState<number>(0);
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeSummary[]>(
    []
  );

  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    if (!organizationId) return;
    const loadSalesData = async () => {
      try {
        const sales = await fetchOrganizationSales({
          organizationId,
          date: currentDate,
        });

        // Get unique employee IDs from sales
        const employeeIds = [...new Set(sales.map((sale) => sale.employeeId))];

        // Fetch employee names
        const employeeNames = await fetchEmployeeNames(employeeIds);

        // Group sales by employee
        const employeeMap: Record<string, EmployeeSales> = {};
        sales.forEach((sale) => {
          if (!employeeMap[sale.employeeId]) {
            employeeMap[sale.employeeId] = { total: 0, sales: [] };
          }
          employeeMap[sale.employeeId].total += sale.amount;
          employeeMap[sale.employeeId].sales.push(sale);
        });

        const summaries = Object.keys(employeeMap).map((employeeId) => ({
          employeeId,
          employeeName: employeeNames[employeeId] || 'Unknown',
          totalSale: employeeMap[employeeId].total,
          sales: employeeMap[employeeId].sales,
        }));

        setEmployeeSummaries(summaries);
        setTotalSale(summaries.reduce((sum, emp) => sum + emp.totalSale, 0));
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    loadSalesData();
  }, [organizationId, currentDate]);

  const handlePreCheck = () => {
    const cashNum = parseFloat(cash) || 0;
    const debitNum = parseFloat(debit) || 0;
    const discountNum = parseFloat(serviceDiscount) || 0;
    const gcBuy = parseFloat(giftcardBuy) || 0;
    const gcRedeem = parseFloat(giftcardRedeem) || 0;
    const expenseNum = parseFloat(expense) || 0;
    const otherIncomeNum = parseFloat(otherIncome) || 0;

    const result =
      cashNum +
      debitNum / 1.13 -
      (totalSale -
        discountNum +
        gcBuy / 1.13 -
        gcRedeem / 1.13 -
        expenseNum +
        otherIncomeNum);
    setResultCheck(result);

    if (result > 40) setResultMessage('Double check over!');
    else if (result < 0) setResultMessage(`Miss $${(result * -1).toFixed(2)}`);
    else setResultMessage('OK');
  };

  const handleSubmit = async () => {
    if (!organizationId) return;

    if (otherIncome && !incomeNote) {
      toast.error('Income note is required when other income has value.');
      return;
    }
    if (expense && !expenseNote) {
      toast.error('Expense note is required when expense has value.');
      return;
    }

    try {
      await saveEndOfDayReport({
        organizationId,
        date: currentDate,
        cash: parseFloat(cash) || 0,
        debit: parseFloat(debit) || 0,
        serviceDiscount: parseFloat(serviceDiscount) || 0,
        giftcardBuy: parseFloat(giftcardBuy) || 0,
        giftcardRedeem: parseFloat(giftcardRedeem) || 0,
        otherIncome: parseFloat(otherIncome) || 0,
        incomeNote,
        expense: parseFloat(expense) || 0,
        expenseNote,
        totalSale,
        employeeSummaries,
        result: resultCheck,
        createdAt: new Date().toISOString(),
      });
      toast.success('End-of-Day Report submitted successfully!');
      router.push(`/organizations/${organizationId}/cashier`);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report.');
    }
  };

  return (
    <div className="container mx-auto mt-6">
      <h1 className="text-2xl font-bold">End of Day Report</h1>
      <p>Date: {currentDate}</p>

      <div className="mt-4 space-y-4">
        {/* Input Fields */}
        <Label>Cash</Label>
        <Input value={cash} onChange={(e) => setCash(e.target.value)} />
        <Label>Debit</Label>
        <Input value={debit} onChange={(e) => setDebit(e.target.value)} />
        <Label>Service Discount</Label>
        <Input
          value={serviceDiscount}
          onChange={(e) => setServiceDiscount(e.target.value)}
        />
        <Label>Giftcard Buy</Label>
        <Input
          value={giftcardBuy}
          onChange={(e) => setGiftcardBuy(e.target.value)}
        />
        <Label>Giftcard Redeem</Label>
        <Input
          value={giftcardRedeem}
          onChange={(e) => setGiftcardRedeem(e.target.value)}
        />
        <Label>Other Income</Label>
        <Input
          value={otherIncome}
          onChange={(e) => setOtherIncome(e.target.value)}
        />

        {otherIncome && (
          <>
            <Label>Income Note</Label>
            <Input
              value={incomeNote}
              onChange={(e) => setIncomeNote(e.target.value)}
            />
          </>
        )}
        <Label>Expense</Label>
        <Input value={expense} onChange={(e) => setExpense(e.target.value)} />
        {expense && (
          <>
            <Label>Expense Note</Label>
            <Input
              value={expenseNote}
              onChange={(e) => setExpenseNote(e.target.value)}
            />
          </>
        )}
      </div>

      <div className="mt-4">
        <Button onClick={handlePreCheck}>Pre-Check</Button>
        <p className="mt-2 text-lg font-semibold">{resultMessage}</p>
      </div>

      <div className="mt-6">
        <Button onClick={handleSubmit}>Submit Report</Button>
      </div>
    </div>
  );
};

// Role Validation Function
const validateEmployeeRole = async (
  user: { uid: string },
  organizationId: string
) => {
  const roles = await fetchUserRoles(user.uid, organizationId);
  return roles.map((role) => role.roles).flat();
};

// Protect the Employee Page
export default withAuth(ReportCashierPage, {
  allowedRoles: ['cashier'],
  validateRole: validateEmployeeRole,
});
