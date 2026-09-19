import { isAxiosError } from 'axios';
import api from '../../config/api';

export type CurrentAffairType = 'national' | 'uttarakhand' | 'international';
export type CurrentAffairPeriod = 'weekly' | 'monthly' | 'half_yearly' | 'yearly';

export interface CurrentAffairItem {
  _id: string;
  title: string;
  description?: string;
  type: CurrentAffairType;
  period: CurrentAffairPeriod;
  pdfUrl: string;
  year?: number;
  month?: number;
  week?: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCurrentAffairPayload {
  title: string;
  description?: string;
  type: CurrentAffairType;
  period: CurrentAffairPeriod;
  pdfUrl: string;
  year?: number;
  month?: number;
  week?: number;
  isActive?: boolean;
  notifyStudents?: boolean;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
};

export const getCurrentAffairs = async (
  token: string,
  params?: { type?: string; period?: string; search?: string }
): Promise<CurrentAffairItem[]> => {
  try {
    const response = await api.get<CurrentAffairItem[]>('/admin/current-affairs', {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch current affairs.'));
  }
};

export const getCurrentAffairDetail = async (
  token: string,
  id: string
): Promise<CurrentAffairItem> => {
  try {
    const response = await api.get<CurrentAffairItem>(`/admin/current-affairs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch current affairs detail.'));
  }
};

export const createCurrentAffair = async (
  token: string,
  payload: CreateCurrentAffairPayload
): Promise<CurrentAffairItem> => {
  try {
    const response = await api.post<CurrentAffairItem>('/admin/current-affairs', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create current affairs.'));
  }
};

export const updateCurrentAffair = async (
  token: string,
  id: string,
  payload: Partial<CreateCurrentAffairPayload>
): Promise<CurrentAffairItem> => {
  try {
    const response = await api.put<CurrentAffairItem>(`/admin/current-affairs/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update current affairs.'));
  }
};

export const deleteCurrentAffair = async (token: string, id: string): Promise<void> => {
  try {
    await api.delete(`/admin/current-affairs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete current affairs.'));
  }
};
