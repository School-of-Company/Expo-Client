import type {
  ProgramForm,
  ProgramFormMutationResult,
  ProgramFormPatchRequest,
  ProgramFormRequest,
} from '@/shared/types/form/program/type';

/** 다른 관리자가 먼저 저장해 `expectedVersion` 이 낡았을 때 서버가 주는 코드 */
export const FORM_VERSION_CONFLICT = 'FORM_VERSION_CONFLICT';

/** ApiError 를 직접 import 하지 않고 `code` 만 본다. node 자체 점검에서 그대로 돌리기 위해서다. */
export const isVersionConflict = (error: unknown) =>
  (error as { code?: unknown } | null)?.code === FORM_VERSION_CONFLICT;

interface ReapplyDeps {
  fetchLatest: () => Promise<ProgramForm>;
  patch: (body: ProgramFormPatchRequest) => Promise<ProgramFormMutationResult>;
}

/**
 * "내 변경 유지한 채 재적용": 최신 version 을 다시 받아 그 version 으로 내 값을 덮어쓴다.
 * 그사이 또 누가 저장하면 다시 FORM_VERSION_CONFLICT 로 실패하고, 호출한 쪽이 모달을 유지한다.
 */
export const reapplyMine = async (
  values: ProgramFormRequest,
  { fetchLatest, patch }: ReapplyDeps,
) => {
  const latest = await fetchLatest();
  return patch({ ...values, expectedVersion: latest.version });
};
