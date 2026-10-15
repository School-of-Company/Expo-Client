import clientInstance from '@/shared/libs/http/clientInstance';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { formRequest } from '../lib/errors';
import type {
  CreateProgramFormRequestDto,
  ProgramFormResponseDto,
  ProgramFormVersionResponseDto,
  UpdateProgramFormRequestDto,
} from '../model/types';

/**
 * 프로그램용 폼 API(Expo-Form-Server#102·#113).
 * 조회만 로그인이 필요 없고(참가자 신청 화면, Expo-Config-Server#34) 나머지는 관리자다.
 */

export const getProgramForm = (formId: string) =>
  formRequest<ProgramFormResponseDto>(
    clientInstance.get(`/forms/by-id/${formId}`),
    '프로그램 폼을 불러오지 못했습니다.',
  );

export const createProgramForm = (
  expoId: string,
  data: CreateProgramFormRequestDto,
) =>
  formRequest<ProgramFormVersionResponseDto>(
    clientTokenInstance.post(`/forms/expos/${expoId}/program-forms`, data),
    '프로그램 폼을 만들지 못했습니다.',
  );

/** 성공하면 version이 1 오른다. 적용 기간을 줄이면 409 PROGRAM_FORM_PROTECTION_PENDING. */
export const updateProgramForm = (
  formId: string,
  data: UpdateProgramFormRequestDto,
) =>
  formRequest<ProgramFormVersionResponseDto>(
    clientTokenInstance.patch(`/forms/by-id/${formId}`, data),
    '프로그램 폼을 수정하지 못했습니다.',
  );

/** 회차 참조 보호가 연결되기 전까지 서버가 409로 거절한다(Expo-Expo-Server#76). */
export const deleteProgramForm = (formId: string) =>
  formRequest<void>(
    clientTokenInstance.delete(`/forms/by-id/${formId}`),
    '프로그램 폼을 삭제하지 못했습니다.',
  );
