'use client';

import { useQuery } from '@tanstack/react-query';
import { getPublicStandardProgram, getTrainingProgram } from '@/shared/api';
import { getPublicPreregisterSessions } from '../api/preRegister';
import type { OwnerApplication } from '../api/myApplications';
import type { Program } from '@/shared/types/program/list/type';

export interface SessionInfo {
  /** 제목·일정을 알 수 없을 때는 식별용 문구만 있다 */
  title: string;
  startedAt: string | null;
  endedAt: string | null;
  /** found: 공개 정의에서 찾음, missing: 삭제·변경으로 목록에 없음, error: 조회 실패 */
  state: 'found' | 'missing' | 'error' | 'loading';
}

/**
 * 신청의 sessionOrProgramId 를 공개 프로그램 목록(`/standard|training/program/{expoId}`)과
 * 공개 사전등록 회차 목록과 맞춰 제목·일정을 구한다. OwnerApplicationDto 에는 제목·일정이 없다.
 */
export const useApplicationSessions = (
  expoId: string,
  applications: OwnerApplication[],
) => {
  const need = (type: OwnerApplication['type']) =>
    applications.some((application) => application.type === type);

  // ProgramApplyContainer 와 같은 키라 캐시를 같이 쓴다
  const standard = useQuery<Program[]>({
    queryKey: ['applyPrograms', 'STANDARD', expoId],
    queryFn: () => getPublicStandardProgram(expoId),
    enabled: need('STANDARD'),
    retry: false,
    meta: { silent: true },
  });
  const training = useQuery<Program[]>({
    queryKey: ['applyPrograms', 'TRAINING', expoId],
    queryFn: () => getTrainingProgram(expoId),
    enabled: need('TRAINING'),
    retry: false,
    meta: { silent: true },
  });

  // 사전등록 회차 선택 화면과 같은 키라 캐시를 같이 쓴다
  const preregister = useQuery({
    queryKey: ['preRegisterSessions', expoId],
    queryFn: () => getPublicPreregisterSessions(expoId),
    enabled: need('PREREGISTER'),
    retry: false,
    meta: { silent: true },
  });

  const getSession = ({
    type,
    sessionOrProgramId: id,
  }: OwnerApplication): SessionInfo => {
    const query =
      type === 'PREREGISTER'
        ? preregister
        : type === 'TRAINING'
          ? training
          : standard;
    const fallback = `${type === 'PREREGISTER' ? '사전등록' : type === 'TRAINING' ? '연수' : '프로그램'} 회차 ${id}`;
    const none = { title: fallback, startedAt: null, endedAt: null };
    if (query.isLoading) return { ...none, state: 'loading' };
    if (query.isError) return { ...none, state: 'error' };
    const program = query.data?.find((item) => item.id === id);
    if (!program) return { ...none, state: 'missing' };
    return {
      title: program.title,
      startedAt: program.startedAt,
      endedAt: program.endedAt,
      state: 'found',
    };
  };

  return {
    getSession,
    hasLookupError: standard.isError || training.isError || preregister.isError,
    retryLookup: () =>
      Promise.all([
        preregister.isError ? preregister.refetch() : undefined,
        standard.isError ? standard.refetch() : undefined,
        training.isError ? training.refetch() : undefined,
      ]),
  };
};
