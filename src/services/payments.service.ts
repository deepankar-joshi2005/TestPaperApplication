import { isAxiosError } from 'axios';
import api from '../config/api';

export type PurchasableItemType = 'series' | 'notesSubject';

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  itemTitle: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const authHeaders = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
};

export const createOrder = async (
  token: string,
  itemType: PurchasableItemType,
  itemId: string
): Promise<CreateOrderResponse> => {
  try {
    const response = await api.post<CreateOrderResponse>(
      '/payments/create-order',
      { itemType, itemId },
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to start payment. Please try again.'));
  }
};

export const verifyPayment = async (
  token: string,
  payload: VerifyPaymentPayload
): Promise<{ success: boolean; itemType: PurchasableItemType; itemId: string }> => {
  try {
    const response = await api.post('/payments/verify', payload, authHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Payment verification failed. Please try again.'));
  }
};
