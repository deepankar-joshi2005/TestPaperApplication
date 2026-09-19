import { isAxiosError } from 'axios';
import api from '../config/api';

export type LockReason = 'payment' | 'upcoming' | 'expired' | null;

export interface TestSeriesSummary {
  category: string;
  iconImage: string | null;
  totalTests: number;
  totalQuestions: number;
  durationMinutes: number;
  difficulty: string;
  percentCompleted: number;
}

export interface TestListItem {
  id: string;
  title: string;
  format: 'mcq' | 'pdf';
  totalQuestions: number;
  durationMinutes: number;
  totalMarks: number;
  difficulty: string;
  status: 'not-attempted' | 'in-progress' | 'completed';
  attemptId: string | null;
  score: number | null;
  scorePercent: number | null;
  maxAttempts: number;
  attemptsUsed: number;
  canReattempt: boolean;
  isFreeSample: boolean;
  isLocked: boolean;
  lockReason: LockReason;
  startDate: string | null;
}

export interface TestsBySeriesResponse {
  seriesId: string;
  seriesTitle: string;
  bannerImage: string | null;
  accessType: 'free' | 'paid';
  price: number;
  isLocked: boolean;
  lockReason: LockReason;
  startDate: string | null;
  endDate: string | null;
  tests: TestListItem[];
}

export interface SeriesListItem {
  id: string;
  title: string;
  shortDescription: string;
  bannerImage: string | null;
  testCount: number;
  totalQuestions: number;
  freeSampleCount: number;
  durationMinutes: number;
  difficulty: string;
  accessType: 'free' | 'paid';
  price: number;
  isLocked: boolean;
  lockReason: LockReason;
  startDate: string | null;
  endDate: string | null;
  isPurchased: boolean;
}

export interface SeriesByCategoryResponse {
  category: string;
  series: SeriesListItem[];
}

export interface TestInstructions {
  id: string;
  title: string;
  seriesTitle: string;
  category: string;
  format: 'mcq' | 'pdf';
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  negativeMarks: number;
}

const authHeaders = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
};

export const getTestSeriesSummary = async (token: string): Promise<TestSeriesSummary[]> => {
  try {
    const response = await api.get<TestSeriesSummary[]>('/tests/summary', authHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load test series. Please try again.'));
  }
};

export const getSeriesByCategory = async (
  token: string,
  category: string
): Promise<SeriesByCategoryResponse> => {
  try {
    const response = await api.get<SeriesByCategoryResponse>(
      `/tests/category/${category}/series`,
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load test series. Please try again.'));
  }
};

export const getTestsBySeries = async (
  token: string,
  seriesId: string
): Promise<TestsBySeriesResponse> => {
  try {
    const response = await api.get<TestsBySeriesResponse>(
      `/tests/series/${seriesId}`,
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load tests. Please try again.'));
  }
};

export const getTestInstructions = async (
  token: string,
  testId: string
): Promise<TestInstructions> => {
  try {
    const response = await api.get<TestInstructions>(
      `/tests/${testId}/instructions`,
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load instructions. Please try again.'));
  }
};
