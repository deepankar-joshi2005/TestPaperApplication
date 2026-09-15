import { isAxiosError } from 'axios';
import { Platform } from 'react-native';
import api from '../../config/api';

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
};

export const uploadImage = async (
  token: string,
  file: { uri: string; name: string; mimeType?: string | null }
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? 'image/jpeg',
    } as unknown as Blob);

    const response = await api.post<{ url: string }>('/admin/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload image.'));
  }
};

export const uploadDocument = async (
  token: string,
  file: { uri: string; name: string; mimeType?: string | null }
): Promise<string> => {
  try {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      // expo-document-picker returns a blob: URI on web — FormData there needs
      // a real Blob/File, not the { uri, name, type } shim used on native RN.
      const blob = await (await fetch(file.uri)).blob();
      formData.append('file', blob, file.name);
    } else {
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? 'application/octet-stream',
      } as unknown as Blob);
    }

    const response = await api.post<{ url: string }>('/admin/upload/document', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Failed to upload document.'));
  }
};
