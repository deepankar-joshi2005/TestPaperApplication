import { isAxiosError } from 'axios';
import api from '../../config/api';

export interface AdminNotesSubject {
  id: string;
  category: string;
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  noteCount: number;
}

export interface NotesSubjectPayload {
  category: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateNotesSubjectPayload {
  category?: string;
  name?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface AdminNotesSubjectNoteItem {
  id: string;
  title: string;
  description: string;
  pdfUrl: string | null;
  order: number;
  isActive: boolean;
}

const authHeaders = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
};

export const listNotesSubjects = async (
  token: string,
  params?: { category?: string }
): Promise<AdminNotesSubject[]> => {
  try {
    const response = await api.get<AdminNotesSubject[]>('/admin/notes-subjects', {
      ...authHeaders(token),
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load subjects.'));
  }
};

export const getNotesSubjectDetail = async (
  token: string,
  subjectId: string
): Promise<AdminNotesSubject> => {
  try {
    const response = await api.get<AdminNotesSubject>(
      `/admin/notes-subjects/${subjectId}`,
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load subject.'));
  }
};

export const createNotesSubject = async (
  token: string,
  payload: NotesSubjectPayload
): Promise<AdminNotesSubject> => {
  try {
    const response = await api.post<AdminNotesSubject>(
      '/admin/notes-subjects',
      payload,
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create subject.'));
  }
};

export const updateNotesSubject = async (
  token: string,
  subjectId: string,
  payload: UpdateNotesSubjectPayload
): Promise<AdminNotesSubject> => {
  try {
    const response = await api.put<AdminNotesSubject>(
      `/admin/notes-subjects/${subjectId}`,
      payload,
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update subject.'));
  }
};

export const deleteNotesSubject = async (token: string, subjectId: string): Promise<void> => {
  try {
    await api.delete(`/admin/notes-subjects/${subjectId}`, authHeaders(token));
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete subject.'));
  }
};

export const getNotesSubjectNotes = async (
  token: string,
  subjectId: string
): Promise<{ subject: { id: string; name: string }; notes: AdminNotesSubjectNoteItem[] }> => {
  try {
    const response = await api.get(`/admin/notes-subjects/${subjectId}/notes`, authHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load chapters for this subject.'));
  }
};
