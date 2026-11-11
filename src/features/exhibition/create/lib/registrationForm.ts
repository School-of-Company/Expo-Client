import { createForm } from '@/entities/form/api/forms';
import { transformFormData } from '@/features/form/common/model/formUtils';
import {
  createSystemQuestions,
  SYSTEM_FIELD_LABEL,
  SystemField,
} from '@/features/form/common/model/systemQuestions';
import { validateFields } from '@/features/form-builder';
import type { DynamicFormItemRequest } from '@/entities/form/model/types';
import type { DynamicFormItem } from '@/shared/types/application/type';
import type {
  ExhibitionFormData,
  RegistrationFormDraft,
} from '@/shared/types/exhibition/type';

export type RegistrationParticipant = 'STANDARD' | 'TRAINEE';

export const REGISTRATION_PARTICIPANTS: RegistrationParticipant[] = [
  'STANDARD',
  'TRAINEE',
];

export const REGISTRATION_LABEL: Record<RegistrationParticipant, string> = {
  STANDARD: '참가자 등록 폼',
  TRAINEE: '연수자 등록 폼',
};

/** 신청 서버가 읽는 문항. 일반 참가자는 Form 서버가 빠지면 거절한다(Expo-Form-Server#279) */
const REQUIRED_FIELDS: Record<RegistrationParticipant, SystemField[]> = {
  STANDARD: ['NAME', 'PHONE_NUMBER', 'OCCUPATION', 'SCHOOL'],
  TRAINEE: ['NAME', 'PHONE_NUMBER'],
};

const sentence = (
  id: number,
  dynamicFormType: 'NAME' | 'PHONE_NUMBER',
): DynamicFormItem => ({
  id,
  title: SYSTEM_FIELD_LABEL[dynamicFormType],
  formType: 'SENTENCE',
  jsonData: {},
  requiredStatus: true,
  otherJson: null,
  dynamicFormType,
});

/** 빌더에 처음 넣을 필수 문항. 일반 참가자는 폼 만들기 화면과 같은 문항을 서버 모양으로 바꿔 넣는다 */
const createRequiredFields = (
  participant: RegistrationParticipant,
): DynamicFormItem[] => {
  if (participant === 'TRAINEE')
    return [sentence(-1, 'NAME'), sentence(-2, 'PHONE_NUMBER')];
  const request = transformFormData(
    { title: '', informationText: '', questions: createSystemQuestions() },
    'STANDARD',
    'application',
    'PRE',
    '',
    '',
  );
  const fields = 'dynamicForm' in request ? request.dynamicForm : [];
  return fields.map((field, index) => ({
    ...field,
    id: -(index + 1),
  })) as DynamicFormItem[];
};

export const createRegistrationDrafts = (): Record<
  RegistrationParticipant,
  RegistrationFormDraft
> => ({
  // 현장등록을 마쳐야 프로그램을 신청할 수 있어 일반 참가자 현장등록은 기본으로 만든다
  STANDARD: {
    enabled: true,
    pre: false,
    field: true,
    preStartedAt: null,
    preEndedAt: null,
    informationText: '',
    dynamicForm: createRequiredFields('STANDARD'),
  },
  TRAINEE: {
    enabled: false,
    pre: false,
    field: true,
    preStartedAt: null,
    preEndedAt: null,
    informationText: '',
    dynamicForm: createRequiredFields('TRAINEE'),
  },
});

/** 저장 전에 서버가 거절할 등록 폼을 막는다. 문제가 없으면 null */
export const getRegistrationProblem = (
  participant: RegistrationParticipant,
  draft: RegistrationFormDraft,
): string | null => {
  if (!draft.enabled) return null;
  const label = REGISTRATION_LABEL[participant];
  if (!draft.pre && !draft.field)
    return `${label}: 사전등록·현장등록 중 하나 이상 골라주세요.`;
  if (draft.pre) {
    if (!draft.preStartedAt || !draft.preEndedAt)
      return `${label}: 사전등록 기간을 입력해주세요.`;
    if (draft.preStartedAt >= draft.preEndedAt)
      return `${label}: 사전등록 마감은 시작보다 늦어야 합니다.`;
  }
  const missing = REQUIRED_FIELDS[participant].filter(
    (type) => !draft.dynamicForm.some((item) => item.dynamicFormType === type),
  );
  if (missing.length > 0)
    return `${label}: ${missing.map((type) => SYSTEM_FIELD_LABEL[type]).join(', ')} 문항이 필요합니다.`;
  if (participant === 'STANDARD' && !draft.informationText.trim())
    return `${label}: 개인정보 동의 안내문을 입력해주세요.`;
  if (validateFields(draft.dynamicForm).size > 0)
    return `${label}: 질문에 표시된 문제를 고쳐주세요.`;
  return null;
};

const toIso = (local: string) => new Date(local).toISOString();

/**
 * 박람회를 만든 뒤 등록 폼을 만든다. 사전·현장마다 같은 질문의 폼을 하나씩 만든다.
 * 현장등록은 박람회 첫날 0시부터 마지막 날 끝까지 받는다
 */
export const createRegistrationForms = async (
  expoId: string,
  data: ExhibitionFormData,
) => {
  for (const participant of REGISTRATION_PARTICIPANTS) {
    const draft = data.registrationForms[participant];
    if (!draft.enabled) continue;
    const dynamicForm: DynamicFormItemRequest[] = draft.dynamicForm.map(
      ({
        title,
        formType,
        jsonData,
        requiredStatus,
        otherJson,
        dynamicFormType,
      }) => ({
        title,
        formType,
        jsonData,
        requiredStatus,
        otherJson,
        dynamicFormType: dynamicFormType ?? 'DEFAULT',
      }),
    );
    const periods = [
      ...(draft.pre
        ? [
            {
              applicationType: 'PRE' as const,
              startDate: toIso(draft.preStartedAt ?? ''),
              endDate: toIso(draft.preEndedAt ?? ''),
            },
          ]
        : []),
      ...(draft.field
        ? [
            {
              applicationType: 'FIELD' as const,
              startDate: toIso(`${data.startedDay.slice(0, 10)}T00:00`),
              endDate: toIso(`${data.finishedDay.slice(0, 10)}T23:59`),
            },
          ]
        : []),
    ];
    for (const period of periods) {
      await createForm(expoId, {
        title: `${REGISTRATION_LABEL[participant].replace(' 폼', '')} (${period.applicationType === 'PRE' ? '사전' : '현장'})`,
        informationText: draft.informationText,
        participantType: participant,
        dynamicForm,
        ...period,
      });
    }
  }
};
