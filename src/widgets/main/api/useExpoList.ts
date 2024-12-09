import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ExpoItem } from '@/shared/types/Expo/type';

const getExpoList = async (): Promise<ExpoItem[]> => {
  const response = await axios.get('/api/expo');
  return response.data;
};

export const useExpoList = () => {
  return useQuery<ExpoItem[], Error>({
    queryKey: ['expoList'],
    queryFn: getExpoList,
  });
};
