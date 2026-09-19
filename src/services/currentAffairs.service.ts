import { isAxiosError } from 'axios';
import api from '../config/api';
import { CurrentAffairItem } from './admin/currentAffairs.service';

export interface StudentCurrentAffairsResponse {
  items: CurrentAffairItem[];
  typeCounts: {
    national: number;
    uttarakhand: number;
    international: number;
    total: number;
  };
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
};

export const fetchStudentCurrentAffairs = async (
  token: string,
  params?: { type?: string; period?: string; search?: string }
): Promise<StudentCurrentAffairsResponse> => {
  try {
    const response = await api.get<StudentCurrentAffairsResponse>('/current-affairs', {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch current affairs.'));
  }
};

export const fetchStudentCurrentAffairById = async (
  token: string,
  id: string
): Promise<CurrentAffairItem> => {
  try {
    const response = await api.get<CurrentAffairItem>(`/current-affairs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to fetch current affairs detail.'));
  }
};
