import { AxiosRequestConfig } from 'axios';
import { toApiError } from '../libs/http/apiError';
import clientTokenInstance from '../libs/http/clientTokenInstance';
import { ExpoDetail } from '../types/exhibition/detail/type';

export const getExpoDetail = async (
  id: string,
  config?: AxiosRequestConfig,
): Promise<ExpoDetail> => {
  try {
    const response = await clientTokenInstance.get(
      `/expo/${encodeURIComponent(id)}`,
      config,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '박람회 상세 불러오기 실패');
  }
};
