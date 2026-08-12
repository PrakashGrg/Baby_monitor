import apiClient from './client';

export interface RegisterPayload {
  username: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export const registerUser = async (payload: RegisterPayload) => {
  const response = await apiClient.post('/auth/register/', payload);
  return response.data;
};

export const loginUser = async (payload: LoginPayload) => {
  const response = await apiClient.post('/auth/login/', payload);
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get('/auth/profile/');
  return response.data;
};

export const updateProfile = async (data: Partial<{ username: string; email: string; phone: string }>) => {
  const response = await apiClient.patch('/auth/profile/', data);
  return response.data;
};

export const deleteAccount = async () => {
  await apiClient.delete('/auth/profile/');
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const response = await apiClient.post('/auth/profile/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
};