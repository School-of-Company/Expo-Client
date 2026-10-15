import { normalizeExpoId } from './expoRoutes';

/** 미래교육박람회 전용 진입 경로(헤더 메뉴). 실제 화면은 박람회별 사전등록 관리(/admin/registration/{id})를 쓴다 */
export const FUTURE_EDU_EXPO_PATH = '/admin/future-edu-expo';

/**
 * 배포 환경에서 정한 미래교육박람회 박람회 ID(NEXT_PUBLIC_FUTURE_EDU_EXPO_ID). 없거나 형식이 틀리면 null.
 * 이 값이 있어야 헤더가 그 박람회 화면에서만 '미래교육박람회'를 켠다
 */
export const FUTURE_EDU_EXPO_ID = normalizeExpoId(
  process.env.NEXT_PUBLIC_FUTURE_EDU_EXPO_ID ?? '',
);
