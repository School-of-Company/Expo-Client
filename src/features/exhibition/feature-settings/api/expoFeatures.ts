import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { validateCatalog } from '../model/featurePlan';

// Expo-Expo-Server docs/expo-feature-settings.md 의 관리자 기능 설정 계약
export type FeatureReadinessStatus =
  | 'READY'
  | 'NEEDS_SETUP'
  | 'UNAVAILABLE'
  | 'UNKNOWN';

export type ProgramRecruitmentPhase =
  | 'NO_POLICY'
  | 'UPCOMING'
  | 'OPEN'
  | 'ENDED'
  | 'CLOSED';

export interface FeatureReadinessReason {
  code: string;
  message: string;
}

export interface FeatureReadiness {
  status: FeatureReadinessStatus;
  reasons: FeatureReadinessReason[];
}

export interface ProgramSessionReadiness {
  programId: number;
  title: string;
  status: FeatureReadinessStatus;
  reasons: FeatureReadinessReason[];
  recruitment: ProgramRecruitmentPhase;
}

export interface ProgramReadiness {
  totalSessions: number;
  readySessions: number;
  sessions: ProgramSessionReadiness[];
}

export interface ExpoFeature {
  key: string;
  label: string;
  description: string;
  group: string;
  order: number;
  requires: string[];
  configuredEnabled: boolean;
  effectiveEnabled: boolean;
  blockedBy: string[];
  readiness: FeatureReadiness;
  programReadiness?: ProgramReadiness | null;
}

export interface ExpoFeatureGroup {
  key: string;
  label: string;
}

export interface ExpoFeatureApplied {
  autoEnabled: string[];
  reactivated: string[];
  deactivated: string[];
  changed: boolean;
}

export interface ExpoFeatureSettings {
  expoId: string;
  revision: number;
  groups: ExpoFeatureGroup[];
  features: ExpoFeature[];
  authentication: {
    participantPhoneVerificationRequired: boolean;
    participantPhoneVerificationRevision: number;
  };
  applied?: ExpoFeatureApplied | null;
}

export interface UpdateExpoFeatureSettingsRequest {
  expectedRevision: number;
  changes: { key: string; enabled: boolean }[];
  participantPhoneVerificationRequired?: boolean;
  expectedPhoneRevision?: number;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');
const isReasons = (value: unknown) =>
  Array.isArray(value) &&
  value.every(
    (reason) =>
      isObject(reason) &&
      typeof reason.code === 'string' &&
      typeof reason.message === 'string',
  );
const READINESS = ['READY', 'NEEDS_SETUP', 'UNAVAILABLE', 'UNKNOWN'];

const isFeature = (value: unknown): value is ExpoFeature =>
  isObject(value) &&
  typeof value.key === 'string' &&
  typeof value.label === 'string' &&
  typeof value.group === 'string' &&
  typeof value.order === 'number' &&
  isStringArray(value.requires) &&
  typeof value.configuredEnabled === 'boolean' &&
  typeof value.effectiveEnabled === 'boolean' &&
  isStringArray(value.blockedBy) &&
  isObject(value.readiness) &&
  READINESS.includes(value.readiness.status as string) &&
  isReasons(value.readiness.reasons);

export class InvalidFeatureSettingsError extends Error {
  constructor() {
    super(
      '서버가 알 수 없는 형식의 기능 설정을 보냈습니다. 잘못 덮어쓰지 않도록 화면을 열지 않았습니다.',
    );
    this.name = 'InvalidFeatureSettingsError';
  }
}

/**
 * 응답 모양을 확인한다. 모양이 다르거나 다른 박람회의 설정이면 화면에 그리지 않는다
 * (모르는 응답을 "모두 꺼짐" 으로 보이거나 그 값으로 저장하지 않게 한다)
 */
export const parseFeatureSettings = (
  data: unknown,
  expoId: string,
): ExpoFeatureSettings => {
  if (
    !isObject(data) ||
    typeof data.expoId !== 'string' ||
    data.expoId.toLowerCase() !== expoId.toLowerCase() ||
    typeof data.revision !== 'number' ||
    !Array.isArray(data.groups) ||
    !data.groups.every(
      (group) =>
        isObject(group) &&
        typeof group.key === 'string' &&
        typeof group.label === 'string',
    ) ||
    !Array.isArray(data.features) ||
    !data.features.every(isFeature) ||
    !isObject(data.authentication) ||
    typeof data.authentication.participantPhoneVerificationRequired !==
      'boolean' ||
    typeof data.authentication.participantPhoneVerificationRevision !== 'number'
  ) {
    throw new InvalidFeatureSettingsError();
  }
  const settings = data as unknown as ExpoFeatureSettings;
  // 카탈로그의 중복 키·없는 선행 키·순환도 서버와 같은 규칙으로 거른다
  if (validateCatalog(settings.features) !== null) {
    throw new InvalidFeatureSettingsError();
  }
  return {
    ...settings,
    features: [...settings.features].sort((a, b) => a.order - b.order),
  };
};

const path = (expoId: string) => `/expo/${encodeURIComponent(expoId)}/features`;

export const getExpoFeatureSettings = async (
  expoId: string,
): Promise<ExpoFeatureSettings> => {
  try {
    const { data } = await clientTokenInstance.get(path(expoId));
    return parseFeatureSettings(data, expoId);
  } catch (error) {
    throw toApiError(error, '기능 설정을 불러오지 못했습니다.');
  }
};

/** 기능과 전화 인증을 한 번에 저장한다. 서버가 전부 저장하거나 전부 거절한다 */
export const patchExpoFeatureSettings = async (
  expoId: string,
  request: UpdateExpoFeatureSettingsRequest,
): Promise<ExpoFeatureSettings> => {
  try {
    const { data } = await clientTokenInstance.patch(path(expoId), request);
    return parseFeatureSettings(data, expoId);
  } catch (error) {
    throw toApiError(error, '기능 설정을 저장하지 못했습니다.');
  }
};
