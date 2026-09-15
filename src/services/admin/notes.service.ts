import { isAxiosError } from 'axios';
import api from '../../config/api';

export interface AdminNote {
  _id: string;
  subject: string;
  title: string;
  description: string;
  pdfUrl: string | null;
  order: number;
  isActive: boolean;
}

export interface CreateNotePayload {
  subject: string;
  title: string;
  description?: string;
  pdfUrl: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateNotePayload {
  title?: string;
  description?: string;
  pdfUrl?: string;
  order?: number;
  isActive?: boolean;
}

const authHeaders = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
};

export const getNoteDetail = async (token: string, noteId: string): Promise<AdminNote> => {
  try {
    const response = await api.get<AdminNote>(`/admin/notes/${noteId}`, authHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to load chapter.'));
  }
};

export const createNote = async (
  token: string,
  payload: CreateNotePayload
): Promise<AdminNote> => {
  try {
    const response = await api.post<AdminNote>('/admin/notes', payload, authHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to create chapter.'));
  }
};

export const updateNote = async (
  token: string,
  noteId: string,
  payload: UpdateNotePayload
): Promise<AdminNote> => {
  try {
    const response = await api.put<AdminNote>(
      `/admin/notes/${noteId}`,
      payload,
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to update chapter.'));
  }
};

export const deleteNote = async (token: string, noteId: string): Promise<void> => {
  try {
    await api.delete(`/admin/notes/${noteId}`, authHeaders(token));
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to delete chapter.'));
  }
};
