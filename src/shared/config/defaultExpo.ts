import { normalizeExpoId } from './expoRoutes';

/** 관리자 박람회 목록. `/` 는 참가자 신청 화면이 쓴다 */
export const EXPO_LIST_PATH = '/exhibition';

/**
 * 박람회 ID 없이 `/`·`/application/forms` 로 들어온 참가자에게 보여 줄 박람회(NEXT_PUBLIC_DEFAULT_EXPO_ID).
 * 없거나 형식이 틀리면 null 이고, 그때 `/` 는 관리자 박람회 목록으로 보낸다
 */
export const DEFAULT_EXPO_ID = normalizeExpoId(
  process.env.NEXT_PUBLIC_DEFAULT_EXPO_ID ?? '',
);
