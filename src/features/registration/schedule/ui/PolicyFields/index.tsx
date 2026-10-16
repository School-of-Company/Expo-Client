'use client';

import { useId } from 'react';
import { Input, InputLabelContext, ToggleButton } from '@/shared/ui';
import { DateTimeInput, ScheduleProgram } from '../../../common';
import {
  AdminOccupation,
  ProgramSessionType,
} from '../../../common/api/ledgerApi';
import { OCCUPATION_LABEL } from '../../../common/model/ledger';
import {
  EMPTY_CHANNEL_FORM,
  EMPTY_GUARDIAN_POLICY_FORM,
  GuardianPolicyForm,
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

/** 제목과 안의 입력(Input)을 접근성 이름으로 잇는다 */
export const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const labelId = useId();
  return (
    <div className="space-y-[10px]">
      <FieldLabel id={labelId}>{label}</FieldLabel>
      <InputLabelContext.Provider value={labelId}>
        {children}
      </InputLabelContext.Provider>
    </div>
  );
};

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

  const toggleChannels = (on: boolean) => {
    if (on) {
      // 지금 정원·직업을 첫 채널로 옮겨 합계가 그대로 이어지게 한다
      onChange({
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

  const guardian = value.guardianPolicy;
  const patchGuardian = (patch: Partial<GuardianPolicyForm>) =>
    guardian && onChange({ guardianPolicy: { ...guardian, ...patch } });

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
      {hasChannels && (
        <ChannelFields
          value={value.channels}
          onChange={(channels) => onChange({ channels })}
        />
      )}
      <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
        {!hasChannels && (
          <>
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
      <Field label="초등 1~3학년 보호자 동반 필수">
        <div className="flex h-[48px] items-center">
          <ToggleButton
            value={value.guardianPolicy !== null}
            onChange={(on) =>
              onChange({
                guardianPolicy: on ? EMPTY_GUARDIAN_POLICY_FORM : null,
              })
            }
          />
        </div>
      </Field>
      {guardian && (
        <div className="space-y-[12px]">
          <p className="break-keep text-caption1r text-gray-500">
            학년은 학생이 폼에 입력한 답변으로만 판정합니다. 문항 제목·선택지
            라벨이 아니라 폼의 문항 ID와 선택지 키(jsonData)를 입력하세요. 이
            회차에만 적용되며, 활성 신청이 있으면 서버가 변경을 막습니다.
          </p>
          <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
            <Field label="참조 폼 버전">
              <Input
                type="number"
                min={1}
                value={guardian.formVersion}
                onChange={(e) => patchGuardian({ formVersion: e.target.value })}
              />
            </Field>
            <Field label="학교급 문항 ID">
              <Input
                type="number"
                min={1}
                value={guardian.schoolTypeQuestionId}
                onChange={(e) =>
                  patchGuardian({ schoolTypeQuestionId: e.target.value })
                }
              />
            </Field>
            <Field label="초등학생 선택지 키">
              <Input
                value={guardian.elementarySchoolValue}
                onChange={(e) =>
                  patchGuardian({ elementarySchoolValue: e.target.value })
                }
              />
            </Field>
            <Field label="학년 문항 ID">
              <Input
                type="number"
                min={1}
                value={guardian.gradeQuestionId}
                onChange={(e) =>
                  patchGuardian({ gradeQuestionId: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-16 mobile:grid-cols-2">
            {guardian.gradeKeys.map((key, index) => (
              <Field key={index} label={`${index + 1}학년 선택지 키`}>
                <Input
                  value={key}
                  onChange={(e) =>
                    patchGuardian({
                      gradeKeys: guardian.gradeKeys.map((item, i) =>
                        i === index ? e.target.value : item,
                      ),
                    })
                  }
                />
              </Field>
            ))}
          </div>
        </div>
      )}
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
