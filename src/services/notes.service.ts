import { isAxiosError } from 'axios';
import api from '../config/api';

export interface NotesCategorySummary {
  category: string;
  iconImage: string | null;
  subjectCount: number;
}

export interface NotesSubjectItem {
  id: string;
  name: string;
  description: string;
  noteCount: number;
}

export interface NotesSubjectListResponse {
  category: string;
  subjects: NotesSubjectItem[];
}

export interface NoteItem {
  id: string;
  title: string;
  description: string;
  pdfUrl: string | null;
}

export interface NotesBySubjectResponse {
  subject: { id: string; name: string };
  category: string;
  notes: NoteItem[];
}

const authHeaders = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
};

export const getNotesSummary = async (token: string): Promise<NotesCategorySummary[]> => {
  try {
    const response = await api.get<NotesCategorySummary[]>('/notes/summary', authHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load notes. Please try again.'));
  }
};

export const getSubjectsByCategory = async (
  token: string,
  category: string
): Promise<NotesSubjectListResponse> => {
  try {
    const response = await api.get<NotesSubjectListResponse>(
      `/notes/category/${category}`,
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load subjects. Please try again.'));
  }
};

export const getNotesBySubject = async (
  token: string,
  subjectId: string
): Promise<NotesBySubjectResponse> => {
  try {
    const response = await api.get<NotesBySubjectResponse>(
      `/notes/subject/${subjectId}`,
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load chapters. Please try again.'));
  }
};
