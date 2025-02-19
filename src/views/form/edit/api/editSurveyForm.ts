import axios from 'axios';
import { CreateFormRequest } from '@/shared/types/form/create/type';

export const editSurveyForm = async ({
  data,
  id,
}: {
  data: CreateFormRequest;
  id: string;
}) => {
  const response = await axios.patch(`/api/survey/${id}`, data);
  return response;
};
