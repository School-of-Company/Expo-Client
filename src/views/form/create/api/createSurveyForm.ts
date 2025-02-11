import axios from 'axios';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const createSurveyForm = async ({
  data,
  id,
}: {
  data: CreateFormRequest;
  id: string;
}) => {
  const response = await axios.post(`/api/survey/${id}`, data);
  return response;
};
