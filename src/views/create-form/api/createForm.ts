import axios from 'axios';
import { CreateFormRequest } from '@/shared/types/create-form/type';

export const createForm = async ({
  data,
  id,
}: {
  data: CreateFormRequest;
  id: string;
}) => {
  const response = await axios.post(`/api/form/${id}`, data);
  return response;
};
