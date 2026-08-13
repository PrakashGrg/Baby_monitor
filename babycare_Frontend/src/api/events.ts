import apiClient from './client';

export interface Event {
  id: number;
  baby: number;
  baby_name: string;
  type: 'motion' | 'cry';
  timestamp: string;
  snapshot: string | null;
}

export const getEvents = async (babyId?: number, type?: 'motion' | 'cry'): Promise<Event[]> => {
  const params: Record<string, string | number> = {};
  if (babyId) params.baby = babyId;
  if (type) params.type = type;

  const response = await apiClient.get('/events/', { params });
  return response.data;
};