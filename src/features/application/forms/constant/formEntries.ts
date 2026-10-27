import { ApplicationType } from '@/shared/types/exhibition/type';

export type FormGroup = 'PRE' | 'FIELD';

export const FORM_GROUPS: {
  key: FormGroup;
  label: string;
}[] = [
  {
    key: 'PRE',
    label: '사전등록',
  },
  {
    key: 'FIELD',
    label: '현장등록',
  },
];

export interface FormEntry {
  key: string;
  group: FormGroup;
  audience: string;
  formType: 'application';
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
];
