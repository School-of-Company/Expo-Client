'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/shared/ui';
import { DateTimeInput, useApplyPeriod } from '../../../common';
import ScheduleSection, { FieldLabel } from '../ScheduleSection';

const ApplyPeriodSection = ({ disabled }: { disabled: boolean }) => {
  const [applyStartAt, setApplyStartAt] = useState<string | null>(null);
  const [applyEndAt, setApplyEndAt] = useState<string | null>(null);
  const { mutate: applyPeriod, isPending } = useApplyPeriod();

  const handleApply = () => {
    if (!applyStartAt && !applyEndAt) {
      toast.error('신청 시작 또는 종료 일시를 입력해주세요.');
      return;
    }
    applyPeriod({ applyStartAt, applyEndAt });
  };

  const handleClear = () => {
    if (!window.confirm('모든 프로그램의 신청기간 제한을 해제할까요?')) return;
    applyPeriod({ applyStartAt: null, applyEndAt: null });
  };

  return (
    <ScheduleSection
      title="신청기간 일괄 설정"
      description="모든 프로그램에 같은 신청기간을 한 번에 넣습니다. 프로그램별 기간은 아래 프로그램 표에서 따로 바꿀 수 있습니다."
    >
      <div className="grid grid-cols-2 gap-[28px] mobile:grid-cols-1">
        <div className="space-y-[10px]">
          <FieldLabel>신청 시작</FieldLabel>
          <DateTimeInput value={applyStartAt} onChange={setApplyStartAt} />
        </div>
        <div className="space-y-[10px]">
          <FieldLabel>신청 종료</FieldLabel>
          <DateTimeInput value={applyEndAt} onChange={setApplyEndAt} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[28px] mobile:grid-cols-1">
        <Button
          variant="gray"
          disabled={disabled || isPending}
          onClick={handleClear}
        >
          기간 제한 해제
        </Button>
        <Button disabled={disabled || isPending} onClick={handleApply}>
          전체 프로그램에 적용
        </Button>
      </div>
    </ScheduleSection>
  );
};

export default ApplyPeriodSection;
