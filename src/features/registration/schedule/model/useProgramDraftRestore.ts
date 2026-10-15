import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { ScheduleProgram } from '../../common';
import { ProgramForm } from './policyForm';
import {
  clearProgramDraft,
  DRAFT_QUERY,
  readProgramDraft,
  toProgramKey,
} from './programFormLink';

/**
 * 폼 생성 화면에서 돌아오면 남겨 둔 회차 초안을 다시 연다.
 * 새 폼을 저장하고 왔으면 그 폼을 초안에 연결한다. 초안은 한 번 열면 지운다
 */
export const useProgramDraftRestore = (
  expoId: string,
  programs: ScheduleProgram[] | undefined,
  onRestore: (target: ScheduleProgram | 'new', form: ProgramForm) => void,
) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isHandled = useRef(false);
  const resume = searchParams.get(DRAFT_QUERY.resume);
  const formId = searchParams.get(DRAFT_QUERY.formId);

  useEffect(() => {
    if (isHandled.current || !programs || (!resume && !formId)) return;
    isHandled.current = true;
    // 새로고침해도 다시 열리지 않게 쿼리를 지운다
    router.replace(pathname, { scroll: false });

    const draft = readProgramDraft(expoId);
    clearProgramDraft(expoId);
    if (!draft) {
      if (formId)
        toast.info(
          '이어서 편집할 회차가 없습니다. 회차 수정에서 새 폼을 선택해주세요.',
        );
      return;
    }
    const target =
      draft.target === 'new'
        ? 'new'
        : programs.find((program) => toProgramKey(program) === draft.target);
    if (!target) {
      toast.error(
        '편집하던 회차를 찾지 못했습니다. 다른 관리자가 삭제했을 수 있습니다.',
      );
      return;
    }
    onRestore(
      target,
      formId
        ? {
            ...draft.form,
            hasPolicy: true,
            policy: { ...draft.form.policy, formId },
          }
        : draft.form,
    );
  }, [expoId, programs, resume, formId, router, pathname, onRestore]);
};
