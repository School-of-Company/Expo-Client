'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, MockDataBadge } from '@/shared/ui';
import {
  DateTimeInput,
  RegistrationSelect,
  ScheduleProgram,
  StatusBadge,
} from '../../../common';
import {
  getPromotionPolicyMock,
  PromotionMode,
  PromotionPolicy,
} from '../../mock/promotionPolicy';
import { Field } from '../PolicyFields';
import ScheduleSection from '../ScheduleSection';

const MOCK_ISSUE = 'Expo-Expo-Server#111';

const MODE_OPTIONS: { value: PromotionMode; label: string }[] = [
  { value: 'AUTO', label: 'AUTO - 자동 승급' },
  { value: 'MANUAL', label: 'MANUAL - 수동 승급' },
];

interface PromotionPolicySectionProps {
  programs: ScheduleProgram[];
}

const toKey = ({ programType, id }: ScheduleProgram) => `${programType}-${id}`;

/** 프로그램 전체의 대기자 승급 방식을 한 번에 바꾼다. 서버 연결 전이라 화면 안에서만 바뀐다 */
const PromotionPolicySection = ({ programs }: PromotionPolicySectionProps) => {
  // 예시 값 위에 화면에서 바꾼 정책만 덮어쓴다
  const [overrides, setOverrides] = useState<Map<string, PromotionPolicy>>(
    new Map(),
  );
  const [mode, setMode] = useState<PromotionMode>('AUTO');
  const [autoPromotionEndedAt, setAutoPromotionEndedAt] = useState<
    string | null
  >(null);

  const policies = programs.map(
    (program) =>
      overrides.get(toKey(program)) ?? getPromotionPolicyMock(program),
  );
  const autoCount = policies.filter((policy) => policy.mode === 'AUTO').length;

  const handleApply = () => {
    setOverrides(
      new Map(
        programs.map((program) => [
          toKey(program),
          {
            mode,
            autoPromotionEndedAt: mode === 'AUTO' ? autoPromotionEndedAt : null,
          },
        ]),
      ),
    );
    toast.info('예시 데이터에만 적용했습니다. 서버 연결 후 저장됩니다.');
  };

  return (
    <ScheduleSection
      variant="aside"
      title="대기자 승급 일괄 정책"
      badge={<MockDataBadge issue={MOCK_ISSUE} />}
      description="평상시 AUTO, 행사 직전에는 MANUAL로 전환할 수 있습니다."
    >
      <div className="flex flex-wrap gap-8">
        <StatusBadge tone="main">AUTO {autoCount}개</StatusBadge>
        <StatusBadge tone="outline">
          MANUAL {policies.length - autoCount}개
        </StatusBadge>
        <StatusBadge tone="gray">전체 {programs.length}개</StatusBadge>
      </div>
      <Field label="승급 방식">
        <RegistrationSelect
          ariaLabel="승급 방식"
          value={mode}
          options={MODE_OPTIONS}
          onChange={(value) => setMode(value as PromotionMode)}
        />
      </Field>
      {mode === 'AUTO' && (
        <Field label="자동승급 종료시각 (선택)">
          <DateTimeInput
            value={autoPromotionEndedAt}
            onChange={setAutoPromotionEndedAt}
          />
        </Field>
      )}
      <div className="space-y-8">
        <Button disabled={programs.length === 0} onClick={handleApply}>
          승급 정책 전체 적용
        </Button>
        <p className="text-caption1r text-gray-500">서버 연결 후 저장됩니다.</p>
      </div>
    </ScheduleSection>
  );
};

export default PromotionPolicySection;
