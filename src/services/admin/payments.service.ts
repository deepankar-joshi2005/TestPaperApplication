import { isAxiosError } from 'axios';
import api from '../../config/api';

export interface AdminPaymentItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  itemType: 'series' | 'notesSubject';
  itemId: string;
  itemTitle: string;
  amount: number;
  purchasedAt: string;
}

export interface AdminPaymentsSummaryEntry {
  id: string;
  title: string;
  revenue: number;
  buyerCount: number;
}

export interface AdminPaymentsSummary {
  totalRevenue: number;
  todaysRevenue: number;
  thisMonthRevenue: number;
  totalPayingStudents: number;
  totalPurchases: number;
  topSeries: AdminPaymentsSummaryEntry[];
  topNotesSubjects: AdminPaymentsSummaryEntry[];
}

const authHeaders = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
};

export const listPayments = async (
  token: string,
  params?: { itemType?: 'series' | 'notesSubject' }
): Promise<AdminPaymentItem[]> => {
  try {
    const response = await api.get<AdminPaymentItem[]>('/admin/payments', {
      ...authHeaders(token),
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load payments.'));
  }
};

export const getPaymentsSummary = async (token: string): Promise<AdminPaymentsSummary> => {
  try {
    const response = await api.get<AdminPaymentsSummary>(
      '/admin/payments/summary',
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load payments summary.'));
  }
};
