import axios from 'axios';
import {
  EXPO_FORBIDDEN_MESSAGE,
  toApiError,
} from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  ExpoMember,
  ExpoMemberRole,
  ExpoStaffInvite,
} from '@/shared/types/exhibition/member/type';

// Expo-Expo-Server ExpoMemberController(#256). 모두 OWNER(또는 최고 관리자)만 부를 수 있다
const basePath = (expoId: string) => `/expo/${encodeURIComponent(expoId)}`;

// 403 은 역할이 모자란 경우라 서버 문구보다 이유를 바로 알린다. 409 는 OWNER 수 제한 같은 서버 문구를 그대로 쓴다
const toError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return new Error(EXPO_FORBIDDEN_MESSAGE);
  }
  return toApiError(error, fallback);
};

export const getExpoMembers = async (expoId: string): Promise<ExpoMember[]> => {
  try {
    const { data } = await clientTokenInstance.get<ExpoMember[]>(
      `${basePath(expoId)}/members`,
    );
    return data;
  } catch (error) {
    throw toError(error, '운영진 목록을 불러오지 못했습니다.');
  }
};

export const postExpoMember = async (
  expoId: string,
  body: { adminId: number; role: ExpoMemberRole },
): Promise<ExpoMember> => {
  try {
    const { data } = await clientTokenInstance.post<ExpoMember>(
      `${basePath(expoId)}/members`,
      body,
    );
    return data;
  } catch (error) {
    throw toError(error, '운영진을 추가하지 못했습니다.');
  }
};

export const patchExpoMember = async (
  expoId: string,
  adminId: number,
  role: ExpoMemberRole,
): Promise<ExpoMember> => {
  try {
    const { data } = await clientTokenInstance.patch<ExpoMember>(
      `${basePath(expoId)}/members/${adminId}`,
      { role },
    );
    return data;
  } catch (error) {
    throw toError(error, '역할을 바꾸지 못했습니다.');
  }
};

export const deleteExpoMember = async (
  expoId: string,
  adminId: number,
): Promise<void> => {
  try {
    await clientTokenInstance.delete(`${basePath(expoId)}/members/${adminId}`);
  } catch (error) {
    throw toError(error, '운영진을 내보내지 못했습니다.');
  }
};

/** 목록의 secret 은 항상 null 이다. 비밀값은 만들 때 한 번만 받는다 */
export const getStaffInvites = async (
  expoId: string,
): Promise<ExpoStaffInvite[]> => {
  try {
    const { data } = await clientTokenInstance.get<ExpoStaffInvite[]>(
      `${basePath(expoId)}/staff-invites`,
    );
    return data;
  } catch (error) {
    throw toError(error, '스태프 링크 목록을 불러오지 못했습니다.');
  }
};

/** label 은 공백 외 1~100자, expiresAt 은 미래 시각(ISO)이다 */
export const postStaffInvite = async (
  expoId: string,
  body: { label: string; expiresAt: string },
): Promise<ExpoStaffInvite> => {
  try {
    const { data } = await clientTokenInstance.post<ExpoStaffInvite>(
      `${basePath(expoId)}/staff-invites`,
      body,
    );
    return data;
  } catch (error) {
    throw toError(error, '스태프 링크를 만들지 못했습니다.');
  }
};

/** 회수는 여러 번 보내도 같다 */
export const deleteStaffInvite = async (
  expoId: string,
  inviteId: string,
): Promise<void> => {
  try {
    await clientTokenInstance.delete(
      `${basePath(expoId)}/staff-invites/${encodeURIComponent(inviteId)}`,
    );
  } catch (error) {
    throw toError(error, '스태프 링크를 회수하지 못했습니다.');
  }
};
