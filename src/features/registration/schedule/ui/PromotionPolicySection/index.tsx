'use client';

import { useState } from 'react';
import { RegistrationSession } from '@/shared/types/registration/type';
import { Button, ToggleButton } from '@/shared/ui';
import { DateTimeInput, usePromotionPolicy } from '../../../common';
import ScheduleSection, { FieldLabel } from '../ScheduleSection';

interface PromotionPolicySectionProps {
  sessions: RegistrationSession[];
  autoPromotionUntil: string | null;
  disabled: boolean;
}

const PromotionPolicySection = ({
  sessions,
  autoPromotionUntil,
  disabled,
}: PromotionPolicySectionProps) => {
  const autoCount = sessions.filter(
    ({ promotionMode }) => promotionMode === 'AUTO',
  ).length;
  const [isAuto, setIsAuto] = useState(
    autoCount >= sessions.length - autoCount,
  );
  const [until, setUntil] = useState<string | null>(autoPromotionUntil);
  const { mutate: applyPolicy, isPending } = usePromotionPolicy();

  const handleApply = () => {
    const mode = isAuto ? 'AUTO' : 'MANUAL';
    if (
      !window.confirm(
        `전체 ${sessions.length}개 회차를 ${mode} 승급으로 바꿀까요?`,
      )
    )
      return;
    applyPolicy({
      promotionMode: mode,
      autoPromotionUntil: isAuto ? until : null,
    });
  };

  return (
    <ScheduleSection
      title="대기자 승급 정책"
      description="자동 승급은 취소가 생기면 대기 순서대로 바로 확정합니다. 행사 직전에는 꺼두고 접수대장에서 직접 승급할 수 있습니다."
    >
      <div className="space-y-[28px] rounded-sm border-1 border-solid border-gray-200 px-30 py-20 mobile:px-16">
        <div className="flex items-center justify-between gap-16">
          <div className="space-y-6">
            <FieldLabel>자동 승급</FieldLabel>
            <p className="text-caption1r text-gray-500">
              현재 자동 <span className="text-main-600">{autoCount}</span> ·
              수동 {sessions.length - autoCount} · 전체 {sessions.length}개 회차
            </p>
          </div>
          <ToggleButton value={isAuto} onChange={setIsAuto} />
        </div>
        {isAuto && (
          <div className="space-y-[10px]">
            <FieldLabel>자동 승급 종료 일시 (선택)</FieldLabel>
            <DateTimeInput value={until} onChange={setUntil} />
            <p className="text-caption1r text-gray-500">
              이 일시 이후에는 취소가 생겨도 자동으로 승급하지 않습니다.
            </p>
          </div>
        )}
      </div>
      <Button disabled={disabled || isPending} onClick={handleApply}>
        전체 회차에 적용
      </Button>
    </ScheduleSection>
  );
};

export default PromotionPolicySection;
