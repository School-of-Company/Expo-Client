import { useQuery } from '@tanstack/react-query';
import { getAddressFromCoords } from '../api/getAddressFromCoords';

export const useAddressQuery = (latitude: number, longitude: number) => {
  return useQuery({
    queryKey: ['address', latitude, longitude],
    queryFn: () => getAddressFromCoords(latitude, longitude),
    enabled: !!latitude && !!longitude,
  });
};
