import { getExpoRoutes, getRegistrationRoutes } from '@/shared/config';

export interface FeatureLink {
  label: string;
  href: string;
}

/**
 * 기능 키 → 그 기능을 준비하는 기존 화면. 서버가 주소를 내려주지 않고 기존 경로 factory 로만 만든다.
 * 여기 없는 키(새로 더한 기능)는 바로가기 없이 행만 그린다
 */
export const getFeatureLinks = (
  expoId: string,
): Partial<Record<string, FeatureLink>> => {
  const expo = getExpoRoutes(expoId);
  const registration = getRegistrationRoutes(expoId);
  // 대기 정원·자동 승급·현장 접수 기간·취소 기한은 회차별 설정이 원본이다
  const sessions = { label: '회차·모집 설정', href: registration.schedule };
  return {
    PRE_REGISTRATION: { label: '사전예매 회차', href: registration.schedule },
    FIELD_REGISTRATION: {
      label: '현장 등록 QR',
      href: expo.accessQr('STANDARD', 'FIELD'),
    },
    COMPANION_REGISTRATION: { label: '등록용 폼', href: registration.forms },
    QR_ADMISSION: { label: '박람회 입장', href: expo.checkIn },
    PAPER_QR: { label: '종이 QR 발급', href: expo.paperQr },
    STANDARD_PROGRAM: sessions,
    TRAINING_PROGRAM: sessions,
    STANDARD_ATTENDANCE: { label: '프로그램 출석', href: expo.program },
    TRAINING_ATTENDANCE: { label: '프로그램 출석', href: expo.program },
    SURVEY: { label: '만족도 조사', href: registration.survey },
    SURVEY_LOTTERY: { label: '경품 추첨 운영', href: registration.lottery },
    BULK_MESSAGE: {
      label: '접수대장 단체 발송',
      href: registration.applications,
    },
  };
};

/** 그 기능 행에 덧붙이는 안내. 기능 ON/OFF와 헷갈리기 쉬운 기존 설정을 구분한다 */
export const FEATURE_NOTES: Partial<Record<string, string>> = {
  STANDARD_PROGRAM:
    '대기 정원·자동 승급·현장 접수 기간·취소 기한은 회차마다 따로 정합니다.',
  TRAINING_PROGRAM:
    '대기 정원·자동 승급·현장 접수 기간·취소 기한은 회차마다 따로 정합니다.',
  SURVEY_LOTTERY:
    '켜는 것은 추첨 사용을 허용할 뿐 추첨을 시작하지 않습니다. 실제 추첨은 경품 추첨 운영을 시작하고 당첨 번호를 정해야 합니다.',
};
