import axios from 'axios';
import { AddressResponse } from '@/shared/types/exhibition/edit/type';

export const getAddress = async (
  x: string,
  y: string,
): Promise<AddressResponse> => {
  const response = await axios.get(`/api/map/change-geo`, {
    params: {
      x,
      y,
    },
  });
  return response.data;
};
