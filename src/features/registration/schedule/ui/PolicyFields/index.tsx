'use client';

import { Input, ToggleButton } from '@/shared/ui';
import { DateTimeInput, ScheduleProgram } from '../../../common';
import {
  AdminOccupation,
  ProgramSessionType,
} from '../../../common/api/ledgerApi';
import { OCCUPATION_LABEL } from '../../../common/model/ledger';
import { PolicyForm, withCapacityTotals } from '../../model/policyForm';
import { toCount } from '../../model/sessionForm';
import ProgramFormPicker from '../ProgramFormPicker';
import ProgramGroupPicker from '../ProgramGroupPicker';
import { FieldLabel } from '../ScheduleSection';

interface PolicyFieldsProps {
  expoId: string;
  programType: ProgramSessionType;
  /** 묶음·공유 폼을 찾을 이 행사의 회차 */
  programs: ScheduleProgram[];
  /** 고치는 회차의 toProgramKey. 새 회차면 없다 */
  programKey?: string;
  value: PolicyForm;
  onChange: (patch: Partial<PolicyForm>) => void;
  onCreateForm: () => void;
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

/**
 * 프로그램 모집 정책(ProgramPolicyRequest) 입력.
 * 질문·필수 여부·안내·응답 기간은 폼이, 신청 자격·정원·대기·모집/취소/승급 조건은 회차가 정한다
 */
const PolicyFields = ({
  expoId,
  programType,
  programs,
  programKey,
  value,
  onChange,
  onCreateForm,
}: PolicyFieldsProps) => {
  const totals = withCapacityTotals(value);

  const toggleOccupation = (occupation: AdminOccupation) =>
    onChange({
      allowedOccupations: value.allowedOccupations.includes(occupation)
        ? value.allowedOccupations.filter((item) => item !== occupation)
        : [...value.allowedOccupations, occupation],
    });

  return (
    <div className="space-y-[20px]">
      <Field label="프로그램 폼">
        <ProgramFormPicker
          expoId={expoId}
          programType={programType}
          programs={programs}
          programKey={programKey}
          policy={value}
          onChange={(formId) => onChange({ formId })}
          onCreateForm={onCreateForm}
        />
      </Field>
      <Field label="프로그램 묶음 (선택)">
        <ProgramGroupPicker
          programs={programs}
          programKey={programKey}
          value={value.groupId}
          onChange={(groupId) => onChange({ groupId })}
        />
        <p className="text-caption1r text-gray-500">
          같은 묶음의 회차 중에서는 하나만 신청할 수 있습니다.
        </p>
      </Field>
      <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
        <Field label="사전 접수 정원">
          <Input
            type="number"
            min={0}
            value={value.preRegistrationCapacity}
            onChange={(e) =>
              onChange({ preRegistrationCapacity: toCount(e.target.value) })
            }
          />
        </Field>
        <Field label="현장 접수 정원">
          <Input
            type="number"
            min={0}
            value={value.onsiteCapacity}
            onChange={(e) =>
              onChange({ onsiteCapacity: toCount(e.target.value) })
            }
          />
        </Field>
        <Field label="총정원">
          <p className="flex h-[48px] items-center">{totals.capacity}명</p>
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
      <Field label="신청 가능 직업 (하나 이상)">
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
    </div>
  );
};

export default PolicyFields;
