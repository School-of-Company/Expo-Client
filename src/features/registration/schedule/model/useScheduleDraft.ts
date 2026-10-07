import { useEffect, useState } from 'react';
import {
  RegistrationOverview,
  RegistrationProgram,
  RegistrationSession,
} from '@/shared/types/registration/type';

interface ScheduleDraft {
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
}

const toDraft = ({
  programs,
  sessions,
}: RegistrationOverview): ScheduleDraft => ({
  programs: programs.map((program) => ({ ...program })),
  sessions: sessions.map((session) => ({ ...session })),
});

/** 서버 값과 별개로 편집 중인 프로그램·회차를 보관하고 저장 전 이탈을 막는다 */
export const useScheduleDraft = (data: RegistrationOverview | undefined) => {
  const [draft, setDraft] = useState<ScheduleDraft | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (data && !isDirty) setDraft(toDraft(data));
  }, [data, isDirty]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const updateProgram = (id: number, patch: Partial<RegistrationProgram>) => {
    setIsDirty(true);
    setDraft(
      (prev) =>
        prev && {
          ...prev,
          programs: prev.programs.map((program) =>
            program.id === id ? { ...program, ...patch } : program,
          ),
        },
    );
  };

  const updateSession = (id: number, patch: Partial<RegistrationSession>) => {
    setIsDirty(true);
    setDraft(
      (prev) =>
        prev && {
          ...prev,
          sessions: prev.sessions.map((session) =>
            session.id === id ? { ...session, ...patch } : session,
          ),
        },
    );
  };

  /** 저장 성공 또는 변경 취소 시 서버 값으로 다시 맞춘다 */
  const reset = () => setIsDirty(false);

  return { draft, isDirty, updateProgram, updateSession, reset };
};
