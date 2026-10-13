import clientInstance from '@/shared/libs/http/clientInstance';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  ProgramForm,
  ProgramFormMutationResult,
  ProgramFormPatchRequest,
  ProgramFormRequest,
} from '@/shared/types/form/program/type';
import { toProgramFormError } from './programFormErrors';

/**
 * 프로그램용 폼 API(Form v0.8.0/v0.9.0, Expo-Form-Server#102·#113).
 * 옛 `/program-forms` 경로는 없어졌다. 조회만 로그인이 필요 없고 나머지는 관리자다.
 */

/** 참가자 신청 화면이 쓴다. 로그인 없이 호출한다(Expo-Config-Server#34). */
export const getProgramForm = async (formId: string): Promise<ProgramForm> => {
  try {
    const response = await clientInstance.get(`/forms/by-id/${formId}`);
    return response.data;
  } catch (error) {
    throw toProgramFormError(error, '프로그램 폼 불러오기 실패');
  }
};

export const createProgramForm = async (
  expoId: string,
  data: ProgramFormRequest,
): Promise<ProgramFormMutationResult> => {
  try {
    const response = await clientTokenInstance.post(
      `/forms/expos/${expoId}/program-forms`,
      data,
    );
    return response.data;
  } catch (error) {
    throw toProgramFormError(error, '프로그램 폼 생성 실패');
  }
};

/**
 * `expectedVersion` 이 서버 `version` 과 다르면 409 FORM_VERSION_CONFLICT 다.
 * 제목이 겹치면 PROGRAM_FORM_TITLE_DUPLICATED, 적용 기간을 줄이면 PROGRAM_FORM_PROTECTION_PENDING(둘 다 409).
 */
export const editProgramForm = async (
  formId: string,
  data: ProgramFormPatchRequest,
): Promise<ProgramFormMutationResult> => {
  try {
    const response = await clientTokenInstance.patch(
      `/forms/by-id/${formId}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw toProgramFormError(error, '프로그램 폼 수정 실패');
  }
};

/** 회차 사용 여부 보호가 붙기 전까지 서버가 항상 409 로 거절한다(Expo-Expo-Server#76). */
export const deleteProgramForm = async (formId: string): Promise<void> => {
  try {
    await clientTokenInstance.delete(`/forms/by-id/${formId}`);
  } catch (error) {
    throw toProgramFormError(error, '프로그램 폼 삭제 실패');
  }
};
