import axios from 'axios';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const editApplicationForm = async ({
  data,
  id,
}: {
  data: CreateFormRequest;
  id: string;
}) => {
  const response = await axios.patch(`/api/form/${id}`, data);
  return response;
};
