import { useCallback, useState } from 'react';
import { retryProgramChanges } from '@/shared/api';
import {
  deleteScheduleProgram,
  ScheduleProgram,
  useSchedulePrograms,
  useScheduleMutation,
} from '../../common';
import { ProgramForm } from './policyForm';
import { useProgramDraftRestore } from './useProgramDraftRestore';

export type ProgramEditing = ScheduleProgram | 'new' | null;

/**
 * 프로그램 목록 화면에서 프로그램을 추가·수정·삭제한다.
 * 폼을 만들러 갔다 돌아오면 남겨 둔 초안으로 편집 양식을 다시 연다
 */
export const useProgramEditor = (expoId: string) => {
  const programsQuery = useSchedulePrograms(expoId);
  const programs = programsQuery.data ?? [];
  const [editing, setEditing] = useState<ProgramEditing>(null);
  const [draftForm, setDraftForm] = useState<ProgramForm>();

  useProgramDraftRestore(
    expoId,
    programsQuery.data,
    useCallback((target: ScheduleProgram | 'new', form: ProgramForm) => {
      setDraftForm(form);
      setEditing(target);
    }, []),
  );

  // 초안은 그 양식에만 채운다. 다른 프로그램을 열면 서버 값으로 시작한다
  const open = (target: ScheduleProgram | 'new') => {
    setDraftForm(undefined);
    setEditing(target);
  };

  const find = (programType: ScheduleProgram['programType'], id: number) =>
    programs.find(
      (program) => program.programType === programType && program.id === id,
    );

  const { mutate: removeProgram, isPending: isDeleting } = useScheduleMutation(
    expoId,
    deleteScheduleProgram,
    '프로그램을 삭제했습니다.',
  );

  const { mutate: retry, isPending: isRetrying } = useScheduleMutation(
    expoId,
    () => retryProgramChanges(expoId),
    '중단된 프로그램 변경을 다시 처리했습니다.',
  );
  // 서버 처리가 중간에 멈춘 프로그램. 다시 처리해야 신청이 열린다
  const pendingCount = programs.filter(
    ({ pendingRevision }) => pendingRevision !== null,
  ).length;

  const remove = (program: ScheduleProgram) => {
    if (
      !window.confirm(
        `'${program.title}' 프로그램을 삭제할까요? 신청 이력이 있으면 삭제할 수 없습니다.`,
      )
    )
      return;
    if (editing === program) setEditing(null);
    removeProgram(program);
  };

  return {
    programs,
    editing,
    draftForm,
    open,
    find,
    remove,
    isDeleting,
    pendingCount,
    retry: () => retry(undefined),
    isRetrying,
    close: () => setEditing(null),
  };
};
