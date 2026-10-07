'use client';

import { useMemo } from 'react';
import { withLoading } from '@/shared/hocs';
import { Button, DetailHeader } from '@/shared/ui';
import {
  getSessionStats,
  useDeleteSession,
  useRegistrationOverview,
  useSaveSchedule,
} from '../../../common';
import { useScheduleDraft } from '../../model/useScheduleDraft';
import ApplyPeriodSection from '../ApplyPeriodSection';
import ProgramSection from '../ProgramSection';
import PromotionPolicySection from '../PromotionPolicySection';
import SessionSection from '../SessionSection';

const ScheduleManager = () => {
  const { data, isLoading } = useRegistrationOverview();
  const { draft, isDirty, updateProgram, updateSession, reset } =
    useScheduleDraft(data);
  const { mutate: saveSchedule, isPending: isSaving } = useSaveSchedule();
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();

  const sessionStats = useMemo(
    () => getSessionStats(data?.applications ?? []),
    [data],
  );

  const handleSave = () => {
    if (!draft) return;
    saveSchedule(draft, { onSuccess: reset });
  };

  const handleCancel = () => {
    if (!window.confirm('저장하지 않은 변경 내용을 모두 되돌릴까요?')) return;
    reset();
  };

  const handleDelete = (sessionId: number) => {
    if (!window.confirm('이 회차를 삭제할까요?')) return;
    deleteSession(sessionId);
  };

  return withLoading({
    isLoading: isLoading || !data || !draft,
    children: data && draft && (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[80px] pb-[120px]">
        <DetailHeader textCenter headerTitle="일정·모집 제어" />

        <ApplyPeriodSection disabled={isDirty} />
        <PromotionPolicySection
          key={data.autoPromotionUntil ?? 'none'}
          sessions={data.sessions}
          autoPromotionUntil={data.autoPromotionUntil}
          disabled={isDirty}
        />
        <ProgramSection
          programs={draft.programs}
          sessions={draft.sessions}
          onChange={updateProgram}
          isCreateDisabled={isDirty}
        />
        <SessionSection
          programs={draft.programs}
          sessions={draft.sessions}
          sessionStats={sessionStats}
          onChange={updateSession}
          onDelete={handleDelete}
          isLocked={isDirty || isDeleting}
        />

        {isDirty && (
          <div className="fixed inset-x-0 bottom-0 z-[5] flex justify-center border-t-1 border-solid border-gray-100 bg-white px-16 py-12 shadow-[0px_-4px_8px_0px_rgba(68,143,255,0.08)]">
            <div className="w-full max-w-[1200px] space-y-8">
              <p className="text-caption1r text-gray-500">
                저장하지 않은 변경 내용이 있습니다. 저장 전에는 일괄 적용과
                추가·삭제를 할 수 없습니다.
              </p>
              <div className="grid grid-cols-[1fr_3fr] gap-16">
                <Button variant="gray" onClick={handleCancel}>
                  변경 취소
                </Button>
                <Button disabled={isSaving} onClick={handleSave}>
                  {isSaving ? '저장 중...' : '변경 내용 저장'}
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
