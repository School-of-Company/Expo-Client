import type { FieldConditional } from '@/shared/lib/form-conditional';
import type { ApplicationType } from '@/shared/types/exhibition/type';

export type { ApplicationType };

/**
 * Expo Form Server DTO (OAS `/expo/forms/v3/api-docs`).
 * 날짜는 ISO 문자열이다.
 */

/** 폼의 참여자군. 이름이 겹치는 신청 내역 쪽 `ParticipantType`과는 값이 다르다. */
export type FormParticipantType = 'TRAINEE' | 'STANDARD';

export type FormType =
  | 'SENTENCE'
  | 'CHECKBOX'
  | 'DROPDOWN'
  | 'IMAGE'
  | 'MULTIPLE'
  | 'COMPANION'
  | 'REGION';

export type DynamicFormType =
  | 'NAME'
  | 'PHONE_NUMBER'
  | 'TRAINING_ID'
  | 'OCCUPATION'
  | 'SCHOOL'
  | 'DEFAULT';

/** 선택지 맵. 키는 답변 값으로 쓰이고, 값은 보기 문구다. */
export type JsonData = Record<
  string,
  string | { value: string; isAlwaysSelected: boolean }
>;

export interface OtherJson {
  hasEtc: boolean;
  maxSelection?: number;
  /** `parentIndex`는 문항 목록 안의 위치(0부터). `triggerValue`와 `triggerValues` 중 하나만 온다. */
  conditional?: FieldConditional;
}

/** 요청에 싣는 입력 필드. 응답에서는 `id`가 붙는다. */
export interface DynamicFormItemRequest {
  title: string;
  formType: FormType;
  requiredStatus: boolean;
  jsonData: JsonData;
  otherJson: OtherJson | null;
  dynamicFormType: DynamicFormType;
}

export interface DynamicFormItemResponse extends DynamicFormItemRequest {
  id: number;
}

/** 일반 폼. (박람회, 참여자군, 신청방식) 조합당 하나다. */
export interface CreateFormRequestDto {
  title: string;
  informationText: string;
  participantType: FormParticipantType;
  applicationType: ApplicationType;
  startDate: string;
  endDate: string;
  dynamicForm: DynamicFormItemRequest[];
}

/** 대상은 경로의 expoId와 바디의 참여자군·신청방식으로 정해진다. 필드는 통째로 교체된다. */
export type UpdateFormRequestDto = CreateFormRequestDto;

export interface CreateFormResponseDto {
  id: string;
}

export interface FormResponseDto extends Omit<
  CreateFormRequestDto,
  'dynamicForm'
> {
  id: string;
  expoId: string;
  dynamicForm: DynamicFormItemResponse[];
}

/**
 * 프로그램용 폼. 박람회 안에서 제목이 겹치면 안 된다.
 * IMAGE·COMPANION·REGION 필드와 `otherJson.hasEtc`는 쓸 수 없다(400).
 */
export interface CreateProgramFormRequestDto {
  title: string;
  informationText: string;
  /** `null`이면 대상을 정하지 않는다. 대상 역할은 박람회 서비스의 회차가 정한다. */
  participantType: FormParticipantType | null;
  startDate: string;
  endDate: string;
  dynamicForm: DynamicFormItemRequest[];
}

/** 폼을 불러온 시점의 `version`을 `expectedVersion`으로 담는다. 다르면 409 FORM_VERSION_CONFLICT. */
export interface UpdateProgramFormRequestDto extends CreateProgramFormRequestDto {
  expectedVersion: number;
}

/** 생성·수정 응답. 이어서 고칠 때 이 `version`을 `expectedVersion`으로 쓴다. */
export interface ProgramFormVersionResponseDto {
  id: string;
  version: number;
}

export interface ProgramFormResponseDto extends Omit<
  CreateProgramFormRequestDto,
  'dynamicForm'
> {
  id: string;
  expoId: string;
  dynamicForm: DynamicFormItemResponse[];
  purpose: 'PROGRAM';
  version: number;
}

/**
 * 동행자 한 명(`COMPANION` 답변의 원소). 전화번호 없이 대표자 번호로 등록된다.
 * `occupation`은 직업 키, `region`은 지역 키이고 `school`은 소속이 필요한 직업일 때만 보낸다.
 */
export interface Companion {
  name: string;
  occupation: string;
  region: string;
  school?: string;
}
