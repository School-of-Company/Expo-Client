'use client';

import { useCallback, useMemo, useState } from 'react';
import { retryProgramChanges } from '@/shared/api';
import { withLoading } from '@/shared/hocs';
import { Button } from '@/shared/ui';
import {
  deletePreregisterSession,
  deleteScheduleProgram,
  PreregisterSession,
  retryPreregisterSessionChange,
  ScheduleProgram,
  SectionError,
  SegmentTabs,
  useInvalidateSchedule,
  usePreregisterSessions,
  useRegistrationExpo,
  useSchedulePrograms,
  useScheduleMutation,
} from '../../../common';
import {
  EMPTY_PROGRAM_FORM,
  ProgramForm as ProgramFormValue,
} from '../../model/policyForm';
import { toProgramKey } from '../../model/programFormLink';
import { useProgramDraftRestore } from '../../model/useProgramDraftRestore';
import BulkPolicyModal from '../BulkPolicyModal';
import ProgramForm from '../ProgramForm';
import ScheduleModal from '../ScheduleModal';
import ScheduleTable, {
  ScheduleItem,
  ScheduleKind,
  toSessionItemId,
} from '../ScheduleTable';
import SessionForm from '../SessionForm';

type Filter = 'ALL' | ScheduleKind;

/** 표 위에 열려 있는 양식. 회차 구분을 고르기 전에는 choose */
type Panel =
  | null
  | { type: 'choose' }
  | { type: 'program'; target: ScheduleProgram | 'new'; kind?: ScheduleKind }
  | { type: 'session'; target: number | 'new' };

const ScheduleManager = () => {
  const { expoId } = useRegistrationExpo();
  const sessionsQuery = usePreregisterSessions(expoId);
  const programsQuery = useSchedulePrograms(expoId);
  const invalidate = useInvalidateSchedule(expoId);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [panel, setPanel] = useState<Panel>(null);
  // 폼을 만들고 돌아왔을 때 열린 양식에 채울 회차 초안
  const [draftForm, setDraftForm] = useState<ProgramFormValue>();
  const [retryIds, setRetryIds] = useState<Set<number>>(new Set());
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const programs = useMemo(
    () => programsQuery.data ?? [],
    [programsQuery.data],
  );
  const sessions = useMemo(
    () => sessionsQuery.data ?? [],
    [sessionsQuery.data],
  );

  useProgramDraftRestore(
    expoId,
    programsQuery.data,
    useCallback((target: ScheduleProgram | 'new', form: ProgramFormValue) => {
      setDraftForm(form);
      setPanel({ type: 'program', target });
    }, []),
  );

  const markRetry = (id: number, needsRetry: boolean) =>
    setRetryIds((prev) => {
      const next = new Set(prev);
      if (needsRetry) next.add(id);
      else next.delete(id);
      return next;
    });

  const openPanel = (next: Panel) => {
    setDraftForm(undefined);
    setPanel(next);
  };

  const { mutate: removeProgram, isPending: isDeletingProgram } =
    useScheduleMutation(
      expoId,
      deleteScheduleProgram,
      '프로그램을 삭제했습니다.',
    );
  const { mutate: removeSession, isPending: isDeletingSession } =
    useScheduleMutation(
      expoId,
      (session: PreregisterSession) =>
        deletePreregisterSession(expoId, session.id, session.revision),
      '회차를 삭제했습니다.',
    );
  const { mutate: retryPrograms, isPending: isRetryingPrograms } =
    useScheduleMutation(
      expoId,
      () => retryProgramChanges(expoId),
      '중단된 프로그램 변경을 다시 처리했습니다.',
    );
  const { mutate: retrySession, isPending: isRetryingSession } =
    useScheduleMutation(
      expoId,
      async (session: PreregisterSession) => {
        await retryPreregisterSessionChange(expoId, session.id);
        markRetry(session.id, false);
      },
      '중단된 회차 변경을 다시 처리했습니다.',
    );
  const isBusy =
    isDeletingProgram ||
    isDeletingSession ||
    isRetryingPrograms ||
    isRetryingSession;

  const items = useMemo<ScheduleItem[]>(() => {
    const programItems: ScheduleItem[] = programs.map((program) => ({
      id: toProgramKey(program),
      kind: 'program',
      program,
    }));
    const sessionItems: ScheduleItem[] = [...sessions]
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
      .map((session) => ({
        id: toSessionItemId(session.id),
        kind: 'session',
        session,
        needsRetry: retryIds.has(session.id),
      }));
    return [...programItems, ...sessionItems];
  }, [programs, sessions, retryIds]);

  const matches = (item: ScheduleItem, kind: Filter) => {
    if (kind === 'ALL') return true;
    if (kind === 'PRE') return item.kind === 'session';
    return item.kind === 'program' && item.program.programType === kind;
  };
  const count = (kind: Filter) =>
    items.filter((item) => matches(item, kind)).length;
  const visibleItems = items.filter((item) => matches(item, filter));
  const pendingCount = programs.filter(
    ({ pendingRevision }) => pendingRevision !== null,
  ).length;

  const handleAdd = () => {
    if (filter === 'PRE') openPanel({ type: 'session', target: 'new' });
    else if (filter === 'ALL') openPanel({ type: 'choose' });
    else openPanel({ type: 'program', target: 'new', kind: filter });
  };

  const handleDeleteProgram = (program: ScheduleProgram) => {
    if (
      !window.confirm(
        `'${program.title}' 프로그램을 삭제할까요? 신청 이력이 있으면 삭제할 수 없습니다.`,
      )
    )
      return;
    removeProgram(program);
  };

  const handleDeleteSession = (session: PreregisterSession) => {
    if (!window.confirm(`'${session.title}' 회차를 삭제할까요?`)) return;
    removeSession(session);
  };

  const error = sessionsQuery.error ?? programsQuery.error;
  const closePanel = () => setPanel(null);

  const renderPanel = () => {
    if (!panel) return null;
    if (panel.type === 'choose')
      return (
        <ScheduleModal title="어떤 회차를 추가할까요?" onClose={closePanel}>
          <div className="grid grid-cols-3 gap-12 pb-[28px] mobile:grid-cols-1">
            <Button
              variant="white"
              onClick={() =>
                openPanel({ type: 'program', target: 'new', kind: 'STANDARD' })
              }
            >
              일반 프로그램
            </Button>
            <Button
              variant="white"
              onClick={() =>
                openPanel({ type: 'program', target: 'new', kind: 'TRAINING' })
              }
            >
              연수 프로그램
            </Button>
            <Button
              variant="white"
              onClick={() => openPanel({ type: 'session', target: 'new' })}
            >
              사전등록 회차
            </Button>
          </div>
        </ScheduleModal>
      );
    if (panel.type === 'session') {
      // 저장 뒤 최신 revision 을 쓰도록 목록에서 다시 찾는다
      const session =
        panel.target === 'new'
          ? undefined
          : sessions.find(({ id }) => id === panel.target);
      return (
        <SessionForm
          key={panel.target}
          expoId={expoId}
          session={session}
          onRetryable={(id) => markRetry(id, true)}
          onClose={closePanel}
        />
      );
    }
    const { target, kind } = panel;
    const initialForm =
      draftForm ??
      (target === 'new' && (kind === 'STANDARD' || kind === 'TRAINING')
        ? { ...EMPTY_PROGRAM_FORM, programType: kind }
        : undefined);
    return (
      <ProgramForm
        key={target === 'new' ? `new-${kind}` : toProgramKey(target)}
        expoId={expoId}
        program={target === 'new' ? undefined : target}
        programs={programs}
        initialForm={initialForm}
        onClose={closePanel}
      />
    );
  };

  return withLoading({
    isLoading: sessionsQuery.isLoading || programsQuery.isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col gap-24 pb-[120px]">
        {error ? (
          <SectionError
            message={error.message}
            onRetry={() => void invalidate()}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-12">
              <SegmentTabs
                ariaLabel="회차 구분"
                value={filter}
                options={[
                  { value: 'ALL', label: `전체 ${count('ALL')}` },
                  { value: 'STANDARD', label: `프로그램 ${count('STANDARD')}` },
                  { value: 'TRAINING', label: `연수 ${count('TRAINING')}` },
                  { value: 'PRE', label: `사전등록 ${count('PRE')}` },
                ]}
                onChange={setFilter}
              />
              <div className="flex gap-8">
                <Button
                  variant="white"
                  width="120px"
                  onClick={() => setIsBulkOpen(true)}
                >
                  일괄 설정
                </Button>
                <Button width="120px" onClick={handleAdd}>
                  회차 추가
                </Button>
              </div>
            </div>

            {pendingCount > 0 && (
              <div className="flex items-center justify-between gap-16 rounded-sm border-1 border-solid border-red-200 px-20 py-12 mobile:flex-col mobile:items-stretch">
                <p className="text-body2r text-error">
                  변경이 끝나지 않은 프로그램이 {pendingCount}개 있습니다. 끝날
                  때까지 해당 프로그램은 수정할 수 없습니다.
                </p>
                <Button
                  variant="white"
                  width="120px"
                  disabled={isRetryingPrograms}
                  onClick={() => retryPrograms(undefined)}
                >
                  {isRetryingPrograms ? '처리 중...' : '다시 처리'}
                </Button>
              </div>
            )}

            {renderPanel()}

            <ScheduleTable
              expoId={expoId}
              items={visibleItems}
              programs={programs}
              isBusy={isBusy}
              onEditProgram={(program) =>
                openPanel({ type: 'program', target: program })
              }
              onDeleteProgram={handleDeleteProgram}
              onEditSession={(session) =>
                openPanel({ type: 'session', target: session.id })
              }
              onDeleteSession={handleDeleteSession}
              onRetrySession={retrySession}
            />
          </>
        )}

        {isBulkOpen && (
          <BulkPolicyModal
            expoId={expoId}
            programs={programs}
            onClose={() => setIsBulkOpen(false)}
          />
        )}
      </div>
    ),
  });
};

export default ScheduleManager;
