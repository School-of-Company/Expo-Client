import axios from 'axios';
import { FormattedApplicationData } from '@/shared/types/application/type';

export const postApplication = async (
  params: string,
  type: string,
  data: FormattedApplicationData,
) => {
  const urlMap: Record<string, string> = {
    STANDARD: `/api/application/pre-standard/${params}`,
    DEFAULT: `/api/application/${params}`,
  };

  const url = urlMap[type] || urlMap.DEFAULT;
  const response = await axios.post(url, data);
  return response.data;
};
