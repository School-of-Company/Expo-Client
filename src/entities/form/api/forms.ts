import clientInstance from '@/shared/libs/http/clientInstance';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { formRequest } from '../lib/errors';
import type {
  ApplicationType,
  CreateFormRequestDto,
  CreateFormResponseDto,
  FormParticipantType,
  FormResponseDto,
  UpdateFormRequestDto,
} from '../model/types';

/** 일반 신청 폼. 조회는 참가자 화면도 쓰므로 로그인 없이 호출한다. */

export const getForm = (
  expoId: string,
  participantType: FormParticipantType,
  applicationType: ApplicationType,
) =>
  formRequest<FormResponseDto>(
    clientInstance.get(`/forms/${expoId}`, {
      params: { type: participantType, applicationType },
    }),
    '폼을 불러오지 못했습니다.',
  );

export const createForm = (expoId: string, data: CreateFormRequestDto) =>
  formRequest<CreateFormResponseDto>(
    clientTokenInstance.post(`/forms/${expoId}`, data),
    '폼을 만들지 못했습니다.',
  );

/** 204. 대상은 바디의 `participantType`·`applicationType`으로 정해진다. */
export const updateForm = (expoId: string, data: UpdateFormRequestDto) =>
  formRequest<void>(
    clientTokenInstance.patch(`/forms/${expoId}`, data),
    '폼을 수정하지 못했습니다.',
  );

export const deleteForm = (
  expoId: string,
  participantType: FormParticipantType,
  applicationType: ApplicationType,
) =>
  formRequest<void>(
    clientTokenInstance.delete(
      `/forms/${expoId}/${participantType}/${applicationType}`,
    ),
    '폼을 삭제하지 못했습니다.',
  );
