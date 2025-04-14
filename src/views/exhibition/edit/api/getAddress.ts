import axios from 'axios';
import { AddressResponse } from '@/shared/types/exhibition/edit/type';

export const getAddress = async (
  latitude: string,
  longitude: string,
): Promise<AddressResponse> => {
  const response = await axios.get(`/api/map/change-geo`, {
    params: {
      x: longitude,
      y: latitude,
    },
  });
  return response.data;
};
