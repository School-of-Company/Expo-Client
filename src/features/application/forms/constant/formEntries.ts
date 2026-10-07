import { ApplicationType } from '@/shared/types/exhibition/type';

export type FormGroup = 'PRE' | 'FIELD' | 'SURVEY';

export const FORM_GROUPS: {
  key: FormGroup;
  label: string;
  guide: string;
}[] = [
  {
    key: 'PRE',
    label: '사전등록',
    guide: '박람회 방문 전에 미리 등록해 주세요.',
  },
  {
    key: 'FIELD',
    label: '현장등록',
    guide: '박람회 당일 현장에서 등록해 주세요.',
  },
  {
    key: 'SURVEY',
    label: '만족도 조사',
    guide: '박람회에 참여하신 뒤 만족도 조사에 응답해 주세요.',
  },
];

export interface FormEntry {
  key: string;
  group: FormGroup;
  audience: string;
  formType: 'application' | 'survey';
  userType: 'STANDARD' | 'TRAINEE';
  applicationType: ApplicationType;
}

export const FORM_ENTRIES: FormEntry[] = [
  {
    key: 'pre-standard',
    group: 'PRE',
    audience: '일반',
    formType: 'application',
    userType: 'STANDARD',
    applicationType: 'PRE',
  },
  {
    key: 'pre-trainee',
    group: 'PRE',
    audience: '교원연수',
    formType: 'application',
    userType: 'TRAINEE',
    applicationType: 'PRE',
  },
  {
    key: 'field-standard',
    group: 'FIELD',
    audience: '일반',
    formType: 'application',
    userType: 'STANDARD',
    applicationType: 'FIELD',
  },
  {
    key: 'field-trainee',
    group: 'FIELD',
    audience: '교원연수',
    formType: 'application',
    userType: 'TRAINEE',
    applicationType: 'FIELD',
  },
  {
    key: 'survey-standard',
    group: 'SURVEY',
    audience: '일반',
    formType: 'survey',
    userType: 'STANDARD',
    applicationType: 'PRE',
  },
  {
    key: 'survey-trainee',
    group: 'SURVEY',
    audience: '교원연수',
    formType: 'survey',
    userType: 'TRAINEE',
    applicationType: 'PRE',
  },
];
