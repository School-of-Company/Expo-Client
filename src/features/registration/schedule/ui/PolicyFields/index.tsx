'use client';

import { Input, ToggleButton } from '@/shared/ui';
import { DateTimeInput } from '../../../common';
import { AdminOccupation } from '../../../common/api/ledgerApi';
import { OCCUPATION_LABEL } from '../../../common/model/ledger';
import { PolicyForm } from '../../model/policyForm';
import { toCount } from '../../model/sessionForm';
import { FieldLabel } from '../ScheduleSection';

interface PolicyFieldsProps {
  value: PolicyForm;
  onChange: (patch: Partial<PolicyForm>) => void;
}

const OCCUPATIONS = Object.keys(OCCUPATION_LABEL) as AdminOccupation[];

export const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-[10px]">
    <FieldLabel>{label}</FieldLabel>
    {children}
  </div>
);

/** 프로그램 모집 정책(ProgramPolicyRequest) 입력 */
const PolicyFields = ({ value, onChange }: PolicyFieldsProps) => {
  const toggleOccupation = (occupation: AdminOccupation) =>
    onChange({
      allowedOccupations: value.allowedOccupations.includes(occupation)
        ? value.allowedOccupations.filter((item) => item !== occupation)
        : [...value.allowedOccupations, occupation],
    });

  return (
    <div className="space-y-[20px]">
      <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
        <Field label="정원">
          <Input
            type="number"
            min={1}
            value={value.capacity}
            onChange={(e) => onChange({ capacity: toCount(e.target.value) })}
          />
        </Field>
        <Field label="대기 정원">
          <Input
            type="number"
            min={0}
            value={value.waitingCapacity}
            onChange={(e) =>
              onChange({ waitingCapacity: toCount(e.target.value) })
            }
          />
        </Field>
        <Field label="모집 마감">
          <div className="flex h-[48px] items-center">
            <ToggleButton
              value={value.closed}
              onChange={(closed) => onChange({ closed })}
            />
          </div>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
        <Field label="모집 시작">
          <DateTimeInput
            value={value.applicationStartedAt}
            onChange={(applicationStartedAt) =>
              onChange({ applicationStartedAt })
            }
          />
        </Field>
        <Field label="모집 종료">
          <DateTimeInput
            value={value.applicationEndedAt}
            onChange={(applicationEndedAt) => onChange({ applicationEndedAt })}
          />
        </Field>
        <Field label="취소 마감">
          <DateTimeInput
            value={value.cancelEndedAt}
            onChange={(cancelEndedAt) => onChange({ cancelEndedAt })}
          />
        </Field>
        <Field label="대기 승급 마감">
          <DateTimeInput
            value={value.promotionEndedAt}
            onChange={(promotionEndedAt) => onChange({ promotionEndedAt })}
          />
        </Field>
      </div>
      <Field label="신청 가능 직업 (비우면 제한 없음)">
        <div className="flex flex-wrap gap-8">
          {OCCUPATIONS.map((occupation) => {
            const isSelected = value.allowedOccupations.includes(occupation);
            return (
              <button
                key={occupation}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleOccupation(occupation)}
                className={`rounded-sm border-1 border-solid px-12 py-6 text-caption1r ${
                  isSelected
                    ? 'border-main-600 text-main-600'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                {OCCUPATION_LABEL[occupation]}
              </button>
            );
          })}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
        <Field label="프로그램 폼 ID (선택)">
          <Input
            placeholder="프로그램 폼을 만든 뒤 받은 ID"
            value={value.formId}
            onChange={(e) => onChange({ formId: e.target.value })}
          />
        </Field>
        <Field label="묶음 ID (선택)">
          <Input
            placeholder="같은 묶음에서는 하나만 신청할 수 있습니다"
            value={value.groupId}
            onChange={(e) => onChange({ groupId: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
};

export default PolicyFields;
