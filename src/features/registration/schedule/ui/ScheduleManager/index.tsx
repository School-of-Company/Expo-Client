'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowLeft } from '@/shared/assets/icons';
import { withLoading } from '@/shared/hocs';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { Button } from '@/shared/ui';
import {
  deletePreregisterSession,
  patchPreregisterSession,
  PreregisterSession,
  retryPreregisterSessionChange,
  ScheduleProgram,
  SectionError,
  useInvalidateSchedule,
  usePreregisterSessions,
  useRegistrationExpo,
  useSchedulePrograms,
  useScheduleMutation,
} from '../../../common';
import { ProgramForm } from '../../model/policyForm';
import {
  SessionForm,
  toSessionDefinition,
  toSessionForm,
  validateSessionForm,
} from '../../model/sessionForm';
import { useProgramDraftRestore } from '../../model/useProgramDraftRestore';
import ProgramSection, {
  PROGRAM_FORM_ID,
  ProgramEditing,
} from '../ProgramSection';
import SessionSection, { SessionRow } from '../SessionSection';

// 상태를 바꾼 뒤 그려진 양식으로 스크롤한다
const scrollToForm = (id: string) =>
  requestAnimationFrame(() =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  );

/** 변경이 서버에 남아 재시도로 이어서 처리할 수 있는 실패 */
const isRetryable = (error: unknown) => {
  const status = getErrorStatus(error);
  return status === 502 || status === 503;
};

type ScheduleView = 'STANDARD' | 'TRAINING' | 'PREREGISTER';

const VIEWS: { value: ScheduleView; label: string }[] = [
  { value: 'STANDARD', label: '프로그램' },
  { value: 'TRAINING', label: '연수' },
  { value: 'PREREGISTER', label: '사전예매' },
];

const ScheduleManager = () => {
  const router = useRouter();
  const { expoId } = useRegistrationExpo();
  const sessionsQuery = usePreregisterSessions(expoId);
  const programsQuery = useSchedulePrograms(expoId);
  const invalidate = useInvalidateSchedule(expoId);

  // 서버 값과 별개로 고친 회차만 보관한다
  const [edits, setEdits] = useState<Map<number, SessionForm>>(new Map());
  const [retryIds, setRetryIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = edits.size > 0;
  const [programEditing, setProgramEditing] = useState<ProgramEditing>(null);
  const [draftForm, setDraftForm] = useState<ProgramForm>();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [view, setView] = useState<ScheduleView>('STANDARD');

  useEffect(() => {
    if (!isDirty) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useProgramDraftRestore(
    expoId,
    programsQuery.data,
    useCallback((target: ScheduleProgram | 'new', form: ProgramForm) => {
      setDraftForm(form);
      setProgramEditing(target);
      // 복원한 양식이 열리는 탭으로 옮긴다
      if (target !== 'new') setView(target.programType);
      scrollToForm(PROGRAM_FORM_ID);
    }, []),
  );

  // 초안은 그 양식에만 채운다. 다른 회차를 열면 서버 값으로 시작한다
  const handleProgramEditingChange = (editing: ProgramEditing) => {
    setDraftForm(undefined);
    setProgramEditing(editing);
  };

  const sessions = sessionsQuery.data;
  const rows = useMemo<SessionRow[]>(
    () =>
      [...(sessions ?? [])]
        .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
        .map((session) => ({
          id: session.id,
          session,
          form: edits.get(session.id) ?? toSessionForm(session),
          needsRetry: retryIds.has(session.id),
        })),
    [sessions, edits, retryIds],
  );

  const markRetry = (id: number, needsRetry: boolean) =>
    setRetryIds((prev) => {
      const next = new Set(prev);
      if (needsRetry) next.add(id);
      else next.delete(id);
      return next;
    });

  const { mutate: removeSession, isPending: isDeleting } = useScheduleMutation(
    expoId,
    (session: PreregisterSession) =>
      deletePreregisterSession(expoId, session.id, session.revision),
    '회차를 삭제했습니다.',
  );
  const { mutate: retrySession, isPending: isRetrying } = useScheduleMutation(
    expoId,
    async (session: PreregisterSession) => {
      await retryPreregisterSessionChange(expoId, session.id);
      markRetry(session.id, false);
    },
    '중단된 회차 변경을 다시 처리했습니다.',
  );

  const handleChange = (id: number, patch: Partial<SessionForm>) => {
    const session = sessions?.find((item) => item.id === id);
    if (!session) return;
    setEdits((prev) =>
      new Map(prev).set(id, {
        ...(prev.get(id) ?? toSessionForm(session)),
        ...patch,
      }),
    );
  };

  const handleDelete = (session: PreregisterSession) => {
    if (!window.confirm(`'${session.title}' 회차를 삭제할까요?`)) return;
    removeSession(session);
  };

  const handleCancel = () => {
    if (!window.confirm('저장하지 않은 변경 내용을 모두 되돌릴까요?')) return;
    setEdits(new Map());
  };

  const handleSave = async () => {
    if (!sessions) return;
    const targets = sessions.filter(({ id }) => edits.has(id));
    for (const session of targets) {
      const error = validateSessionForm(edits.get(session.id)!);
      if (error) {
        toast.error(`${session.title}: ${error}`);
        return;
      }
    }

    setIsSaving(true);
    // 회차마다 revision 이 달라 한 건씩 보낸다. 실패한 회차는 수정 내용을 남겨 다시 저장할 수 있게 한다
    const failed: string[] = [];
    const remaining = new Map(edits);
    for (const session of targets) {
      try {
        await patchPreregisterSession(
          expoId,
          session.id,
          session.revision,
          toSessionDefinition(edits.get(session.id)!),
        );
        remaining.delete(session.id);
        markRetry(session.id, false);
      } catch (error) {
        if (isRetryable(error)) {
          // 서버에 저장된 변경을 재시도로 이어서 처리한다
          remaining.delete(session.id);
          markRetry(session.id, true);
        } else if (getErrorStatus(error) === 409) {
          // 다른 변경이 먼저 반영돼 최신 revision 으로 다시 고쳐야 한다
          remaining.delete(session.id);
        }
        failed.push(
          `${session.title}: ${error instanceof Error ? error.message : '실패'}`,
        );
      }
    }
    await invalidate();
    setEdits(remaining);
    setIsSaving(false);

    if (failed.length === 0) {
      toast.success('회차 변경 내용을 저장했습니다.');
    } else {
      toast.error(
        `${targets.length}개 중 ${failed.length}개를 저장하지 못했습니다. ${failed.join(' / ')}`,
      );
    }
  };

  const error = sessionsQuery.error ?? programsQuery.error;
  const programs = programsQuery.data ?? [];
  const isSessionLocked = isDirty || isDeleting || isRetrying || isSaving;

  // 박람회 상세 패널에서 들어오므로 주소로 바로 열어도 상세로 돌아간다. 화면 안 이동은 beforeunload 가 막지 못해 직접 묻는다
  const handleBack = () => {
    if (
      isDirty &&
      !window.confirm('저장하지 않은 회차 변경 내용이 사라집니다. 나갈까요?')
    )
      return;
    router.push(`/exhibition/detail/${encodeURIComponent(expoId)}`);
  };

  return withLoading({
    isLoading: sessionsQuery.isLoading || programsQuery.isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[60px] pb-[120px]">
        {error ? (
          <SectionError
            message={error.message}
            onRetry={() => void invalidate()}
          />
        ) : (
          <div className="min-w-0 flex-1 space-y-36">
            <div className="flex items-center gap-12">
              <button
                type="button"
                aria-label="뒤로 가기"
                className="-m-6 flex h-[44px] w-[44px] flex-none items-center justify-center"
                onClick={handleBack}
              >
                <ArrowLeft size={32} />
              </button>
              <div role="tablist" className="flex gap-[18px]">
                {VIEWS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={view === value}
                    onClick={() => setView(value)}
                    className={`text-h2b ${view === value ? 'text-black' : 'text-gray-500'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {view === 'PREREGISTER' ? (
              <SessionSection
                expoId={expoId}
                rows={rows}
                onChange={handleChange}
                onDelete={handleDelete}
                onRetry={retrySession}
                isLocked={isSessionLocked}
                isCreating={isCreatingSession}
                onCreatingChange={setIsCreatingSession}
              />
            ) : (
              <ProgramSection
                expoId={expoId}
                programs={programs}
                type={view}
                editing={programEditing}
                onEditingChange={handleProgramEditingChange}
                draftForm={draftForm}
              />
            )}
          </div>
        )}

        {isDirty && (
          <div className="fixed inset-x-0 bottom-0 z-[5] flex justify-center border-t-1 border-solid border-gray-100 bg-white px-16 py-12 shadow-[0px_-4px_8px_0px_rgba(68,143,255,0.08)]">
            <div className="w-full max-w-[1200px] space-y-8">
              <p className="text-caption1r text-gray-500">
                저장하지 않은 사전등록 회차 변경 {edits.size}건이 있습니다. 저장
                전에는 사전등록 회차를 추가·삭제할 수 없습니다.
              </p>
              <div className="grid grid-cols-[1fr_3fr] gap-16">
                <Button variant="gray" onClick={handleCancel}>
                  변경 취소
                </Button>
                <Button disabled={isSaving} onClick={handleSave}>
                  {isSaving ? '저장 중...' : '변경 내용 일괄저장'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    ),
  });
};

export default ScheduleManager;
