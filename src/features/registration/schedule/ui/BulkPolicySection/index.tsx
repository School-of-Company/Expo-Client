'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui';
import {
  DateTimeInput,
  patchScheduleProgram,
  ProgramPolicy,
  ScheduleProgram,
  useInvalidateSchedule,
} from '../../../common';
import { toPolicyDateTime, withPolicyPatch } from '../../model/policyForm';
import { Field } from '../PolicyFields';
import ScheduleSection from '../ScheduleSection';

interface BulkPolicySectionProps {
  expoId: string;
  programs: ScheduleProgram[];
  disabled: boolean;
}

/** 모집 정책이 있는 프로그램에 모집 기간·대기 승급 마감을 한 번에 넣는다 */
const BulkPolicySection = ({
  expoId,
  programs,
  disabled,
}: BulkPolicySectionProps) => {
  const [applicationStartedAt, setApplicationStartedAt] = useState<
    string | null
  >(null);
  const [applicationEndedAt, setApplicationEndedAt] = useState<string | null>(
    null,
  );
  const [promotionEndedAt, setPromotionEndedAt] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const invalidate = useInvalidateSchedule(expoId);

  // 정책이 없거나 변경이 끝나지 않은 프로그램은 정책만 바꿀 수 없다
  const targets = programs.filter(
    ({ policy, pendingRevision }) => policy && pendingRevision === null,
  );

  const handleApply = async () => {
    const patch: Partial<ProgramPolicy> = {
      ...(applicationStartedAt && {
        applicationStartedAt: toPolicyDateTime(applicationStartedAt),
      }),
      ...(applicationEndedAt && {
        applicationEndedAt: toPolicyDateTime(applicationEndedAt),
      }),
      ...(promotionEndedAt && {
        promotionEndedAt: toPolicyDateTime(promotionEndedAt),
      }),
    };
    if (Object.keys(patch).length === 0) {
      toast.error('적용할 일시를 하나 이상 입력해주세요.');
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
    // 한 건이 실패해도 나머지는 계속 바꾸고, 실패한 프로그램을 모아 알린다
    const failed: string[] = [];
    try {
      for (const program of targets) {
        try {
          await patchScheduleProgram(program, withPolicyPatch(program, patch));
        } catch (error) {
          failed.push(
            `${program.title}: ${error instanceof Error ? error.message : '실패'}`,
          );
        }
      }
      await invalidate();
    } finally {
      // 목록 새로고침이 실패해도 버튼이 '적용 중'에 묶이지 않게 한다
      setIsApplying(false);
    }

    if (failed.length === 0) {
      toast.success(`${targets.length}개 프로그램에 적용했습니다.`);
    } else {
      toast.error(
        `${targets.length}개 중 ${failed.length}개를 바꾸지 못했습니다. ${failed.join(' / ')}`,
      );
    }
  };

  return (
    <ScheduleSection
      title="모집 일정 일괄 적용"
      description={`모집 정책이 있는 프로그램 ${targets.length}개에 같은 일시를 넣습니다. 비워 둔 항목은 바꾸지 않습니다. 프로그램별 값은 아래 표에서 따로 바꿀 수 있습니다.`}
    >
      <div className="grid grid-cols-3 gap-[28px] mobile:grid-cols-1 tablet:grid-cols-1">
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
      <Button
        disabled={disabled || isApplying || targets.length === 0}
        onClick={handleApply}
      >
        {isApplying ? '적용 중...' : '정책 있는 프로그램 전체에 적용'}
      </Button>
    </ScheduleSection>
  );
};

export default BulkPolicySection;
