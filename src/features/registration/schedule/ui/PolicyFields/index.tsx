'use client';

import { Input, ToggleButton } from '@/shared/ui';
import { DateTimeInput, ScheduleProgram } from '../../../common';
import {
  AdminOccupation,
  ProgramSessionType,
} from '../../../common/api/ledgerApi';
import { OCCUPATION_LABEL } from '../../../common/model/ledger';
import {
  EMPTY_CHANNEL_FORM,
  PolicyForm,
  withChannelTotals,
} from '../../model/policyForm';
import { toCount } from '../../model/sessionForm';
import ChannelFields from '../ChannelFields';
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
  const hasChannels = value.channels.length > 0;
  const totals = withChannelTotals(value);
  const isSplit =
    value.preRegisterCapacity !== null || value.onsiteCapacity !== null;

  const toggleSplit = (on: boolean) =>
    onChange(
      on
        ? { preRegisterCapacity: value.capacity, onsiteCapacity: 0 }
        : {
            capacity: totals.capacity,
            preRegisterCapacity: null,
            onsiteCapacity: null,
          },
    );

  const toggleChannels = (on: boolean) => {
    if (on) {
      // 지금 정원·직업을 첫 채널로 옮겨 합계가 그대로 이어지게 한다
      onChange({
        // 채널별 정원과 사전·현장 정원은 함께 쓰지 않는다
        preRegisterCapacity: null,
        onsiteCapacity: null,
        channels: [
          {
            ...EMPTY_CHANNEL_FORM,
            name: '일반',
            capacity: Math.max(value.capacity, 1),
            waitingCapacity: value.waitingCapacity,
            allowedOccupations: value.allowedOccupations,
          },
        ],
      });
      return;
    }
    if (
      !window.confirm(
        '채널을 모두 지우고 채널 합계를 정원·대기 정원으로 남길까요? 저장하면 채널 없는 회차가 됩니다.',
      )
    )
      return;
    onChange({
      channels: [],
      capacity: totals.capacity,
      waitingCapacity: totals.waitingCapacity,
      allowedOccupations: totals.allowedOccupations,
    });
  };

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
      <div className="flex items-center justify-between gap-16">
        <div className="space-y-6">
          <FieldLabel>신청 채널별 정원</FieldLabel>
          <p className="text-caption1r text-gray-500">
            {hasChannels
              ? `채널 합계: 정원 ${totals.capacity}명 · 대기 ${totals.waitingCapacity}명`
              : '교원·일반처럼 신청 구분마다 정원을 나눌 때 켭니다.'}
          </p>
        </div>
        <ToggleButton value={hasChannels} onChange={toggleChannels} />
      </div>
      {!hasChannels && (
        <div className="flex items-center justify-between gap-16">
          <div className="space-y-6">
            <FieldLabel>사전·현장 접수 정원</FieldLabel>
            <p className="text-caption1r text-gray-500">
              {isSplit
                ? `정원 ${totals.capacity}명 (사전 + 현장)`
                : '사전 접수와 현장 접수 정원을 따로 관리할 때 켭니다.'}
            </p>
          </div>
          <ToggleButton value={isSplit} onChange={toggleSplit} />
        </div>
      )}
      {hasChannels && (
        <ChannelFields
          value={value.channels}
          onChange={(channels) => onChange({ channels })}
        />
      )}
      <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
        {!hasChannels && (
          <>
            {isSplit ? (
              <>
                <Field label="사전 접수 정원">
                  <Input
                    type="number"
                    min={0}
                    value={value.preRegisterCapacity ?? 0}
                    onChange={(e) =>
                      onChange({
                        preRegisterCapacity: toCount(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="현장 접수 정원">
                  <Input
                    type="number"
                    min={0}
                    value={value.onsiteCapacity ?? 0}
                    onChange={(e) =>
                      onChange({ onsiteCapacity: toCount(e.target.value) })
                    }
                  />
                </Field>
              </>
            ) : (
              <Field label="정원">
                <Input
                  type="number"
                  min={1}
                  value={value.capacity}
                  onChange={(e) =>
                    onChange({ capacity: toCount(e.target.value) })
                  }
                />
              </Field>
            )}
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
          </>
        )}
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
      {!hasChannels && (
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
      )}
    </div>
  );
};

export default PolicyFields;
