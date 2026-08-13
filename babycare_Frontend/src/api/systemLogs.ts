import apiClient from './client';

export interface SystemLog {
  id: number;
  baby: number | null;
  baby_name: string | null;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  timestamp: string;
}

export const getSystemLogs = async (babyId?: number): Promise<SystemLog[]> => {
  const params: Record<string, number> = {};
  if (babyId) params.baby = babyId;
  const response = await apiClient.get('/events/logs/', { params });
  return response.data;
};