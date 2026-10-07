import axios from 'axios';
import clientInstance from '@/shared/libs/http/clientInstance';
import {
  FormattedApplicationData,
  FormattedSurveyData,
} from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';

const URL_MAP: Record<'application' | 'survey', Record<string, string>> = {
  application: {
    STANDARD_PRE: '/application/pre-standard/',
    TRAINEE_PRE: '/application/',
    STANDARD_FIELD: '/application/field/standard/',
    TRAINEE_FIELD: '/application/field/',
  },
  survey: {
    STANDARD: '/surveys/answer/standard/',
    TRAINEE: '/surveys/answer/trainee/',
  },
};

const MAX_NETWORK_RETRIES = 2;

const APPLICATION_ERROR_MESSAGES: Record<number, string> = {
  400: '신청 기간이 아니거나 입력한 답변이 올바르지 않습니다.',
  409: '이미 등록된 전화번호입니다.',
  503: '일시적으로 등록할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

export const createIdempotencyKey = () => crypto.randomUUID();

export const postApplication = async (
  params: string,
  formType: 'application' | 'survey',
  userType: 'STANDARD' | 'TRAINEE',
  applicationType: ApplicationType,
  data: FormattedApplicationData | FormattedSurveyData,
  idempotencyKey?: string,
) => {
  const baseUrl = URL_MAP[formType] || {};
  const key =
    formType === 'application' ? `${userType}_${applicationType}` : userType;

  const url = `${baseUrl[key] || '/api/application/'}${params}`;
  const headers =
    formType === 'application' && idempotencyKey
      ? { 'Idempotency-Key': idempotencyKey }
      : undefined;

  for (let attempt = 0; ; attempt++) {
    try {
      const response = await clientInstance.post(url, data, { headers });
      return response.data;
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;

      // 응답을 받지 못한 네트워크 오류는 같은 Idempotency-Key로 재시도합니다.
      if (!error.response && headers && attempt < MAX_NETWORK_RETRIES) {
        continue;
      }

      if (error.response) {
        const { status, data: body } = error.response;
        const fallback =
          formType === 'application'
            ? APPLICATION_ERROR_MESSAGES[status] || '폼 등록 실패'
            : '폼 등록 실패';
        throw new Error(body?.error || body?.message || fallback);
      }

      throw error;
    }
  }
};
