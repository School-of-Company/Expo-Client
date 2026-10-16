'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { XMark } from '@/shared/assets/icons';
import { useModalDialog } from '@/shared/model';
import { Button } from '@/shared/ui';
import {
  DateTimeInput,
  patchProgramApplicationPeriod,
  patchScheduleProgram,
  ScheduleProgram,
  useInvalidateSchedule,
} from '../../../common';
import { toPolicyDateTime, withPolicyPatch } from '../../model/policyForm';
import { Field } from '../PolicyFields';

interface BulkPolicyModalProps {
  expoId: string;
  programs: ScheduleProgram[];
  onClose: () => void;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '실패';

/**
 * 모집 정책이 있는 프로그램에 신청기간·대기 승급 마감을 한 번에 넣는다.
 * 신청기간은 서버 일괄 API 로, 대기 승급 마감은 프로그램마다 바꾼다
 */
const BulkPolicyModal = ({
  expoId,
  programs,
  onClose,
}: BulkPolicyModalProps) => {
  const [applicationStartedAt, setApplicationStartedAt] = useState<
    string | null
  >(null);
  const [applicationEndedAt, setApplicationEndedAt] = useState<string | null>(
    null,
  );
  const [promotionEndedAt, setPromotionEndedAt] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const invalidate = useInvalidateSchedule(expoId);
  // 적용하는 중에는 닫기 버튼처럼 Escape 로도 닫지 않는다
  const dialogRef = useModalDialog({ onClose, canClose: !isApplying });

  // 정책이 없거나 변경이 끝나지 않은 프로그램은 정책만 바꿀 수 없다
  const targets = programs.filter(
    ({ policy, pendingRevision }) => policy && pendingRevision === null,
  );

  const applyPeriod = async (failed: string[]) => {
    const results = await patchProgramApplicationPeriod(expoId, {
      applicationStartedAt: toPolicyDateTime(applicationStartedAt),
      applicationEndedAt: toPolicyDateTime(applicationEndedAt),
    });
    results
      .filter(({ status }) => status === 'FAILED')
      .forEach(({ title, reason }) =>
        failed.push(`${title}: ${reason ?? '신청기간 검증 실패'}`),
      );
  };

  // 한 건이 실패해도 나머지는 계속 바꾸고, 실패한 프로그램을 모아 알린다
  const applyPromotionEnd = async (failed: string[]) => {
    for (const program of targets) {
      try {
        await patchScheduleProgram(
          program,
          withPolicyPatch(program, {
            promotionEndedAt: toPolicyDateTime(promotionEndedAt),
          }),
        );
      } catch (error) {
        failed.push(`${program.title}: ${errorMessage(error)}`);
      }
    }
  };

  const handleApply = async () => {
    const hasPeriod = Boolean(applicationStartedAt || applicationEndedAt);
    if (!hasPeriod && !promotionEndedAt) {
      toast.error('적용할 일시를 하나 이상 입력해주세요.');
      return;
    }
    if (hasPeriod && !(applicationStartedAt && applicationEndedAt)) {
      toast.error('신청기간은 시작과 종료를 함께 입력해주세요.');
      return;
    }
    if (
      applicationStartedAt &&
      applicationEndedAt &&
      applicationStartedAt >= applicationEndedAt
    ) {
      toast.error('모집 종료가 모집 시작보다 늦어야 합니다.');
      return;
    }
    if (
      !window.confirm(
        `모집 정책이 있는 프로그램 ${targets.length}개에 적용할까요?`,
      )
    )
      return;

    setIsApplying(true);
    const failed: string[] = [];
    try {
      if (hasPeriod) await applyPeriod(failed);
      if (promotionEndedAt) {
        // 신청기간을 바꿨으면 바뀐 정책 기준으로 승급 마감을 넣는다
        if (hasPeriod) await invalidate();
        await applyPromotionEnd(failed);
      }
    } catch (error) {
      // 일괄 API 가 통째로 실패하면(연동 장애 등) 아무것도 바뀌지 않았다
      toast.error(errorMessage(error));
      return;
    } finally {
      await invalidate().catch(() => undefined);
      // 목록 새로고침이 실패해도 버튼이 '적용 중'에 묶이지 않게 한다
      setIsApplying(false);
    }

    if (failed.length === 0) {
      toast.success(`${targets.length}개 프로그램에 적용했습니다.`);
    } else {
      toast.error(
        `${failed.length}개 프로그램을 바꾸지 못했습니다. ${failed.join(' / ')}`,
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-policy-title"
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-[560px] flex-col gap-24 overflow-y-auto rounded-sm bg-white px-[40px] py-[36px] outline-none mobile:px-20"
      >
        <div className="flex items-start justify-between gap-16">
          <div className="space-y-4">
            <p id="bulk-policy-title" className="text-h3b text-black">
              신청기간 일괄 설정
            </p>
            <p className="text-caption1r text-gray-500">
              모집 정책이 있는 프로그램 {targets.length}개에 같은 일시를
              넣습니다. 비워 둔 항목은 바꾸지 않습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            aria-label="닫기"
            className="-m-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center"
          >
            <XMark />
          </button>
        </div>
        <div className="space-y-16">
          <Field label="모집 시작">
            <DateTimeInput
              value={applicationStartedAt}
              onChange={setApplicationStartedAt}
            />
          </Field>
          <Field label="모집 종료">
            <DateTimeInput
              value={applicationEndedAt}
              onChange={setApplicationEndedAt}
            />
          </Field>
          <Field label="대기 승급 마감">
            <DateTimeInput
              value={promotionEndedAt}
              onChange={setPromotionEndedAt}
            />
          </Field>
        </div>
        <p className="text-caption1r text-gray-500">
          현장신청은 변경하지 않습니다. 모집 시작이 기존 취소·승급 마감보다 늦은
          프로그램은 바꾸지 않고 알려 드립니다.
        </p>
        <Button
          disabled={isApplying || targets.length === 0}
          onClick={handleApply}
        >
          {isApplying ? '적용 중...' : '적용'}
        </Button>
      </div>
    </div>
  );
};

export default BulkPolicyModal;
