import apiClient from './client';

export interface Baby {
  id: number;
  name: string;
  dob: string;
  gender: 'male' | 'female' | null;
  photo: string | null;
  created_at: string;
}

export interface BabyPayload {
  name: string;
  dob: string;
  gender?: 'male' | 'female';
}

export const getBabies = async (): Promise<Baby[]> => {
  const response = await apiClient.get('/babies/');
  return response.data;
};

export const getBaby = async (id: number): Promise<Baby> => {
  const response = await apiClient.get(`/babies/${id}/`);
  return response.data;
};

export const createBaby = async (payload: BabyPayload): Promise<Baby> => {
  const response = await apiClient.post('/babies/', payload);
  return response.data;
};

export const updateBaby = async (id: number, payload: Partial<BabyPayload>): Promise<Baby> => {
  const response = await apiClient.patch(`/babies/${id}/`, payload);
  return response.data;
};

export const deleteBaby = async (id: number): Promise<void> => {
  await apiClient.delete(`/babies/${id}/`);
};