import { AuthService } from '@/services/authService';

export const requestSocketToken = async (): Promise<string | null> => {
  try {
    const token = await AuthService.getSocketToken();
    return token;
  } catch (error) {
    console.error('Failed to get socket token:', error);
    return null;
  }
};
