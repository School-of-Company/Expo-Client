import type {
  Companion,
  FormType,
  JsonData,
  OtherJson,
} from '@/shared/types/application/type';
import type { ApplicationType } from '@/shared/types/exhibition/type';
import type { DynamicFormType as BuilderDynamicFormType } from '@/shared/types/form/create/type';

export type { ApplicationType, Companion, FormType, JsonData, OtherJson };

/**
 * Expo Form Server DTO (OAS `/expo/forms/v3/api-docs`).
 * 날짜는 ISO 문자열이다.
 */

/** 폼의 참여자군. 이름이 겹치는 신청 내역 쪽 `ParticipantType`과는 값이 다르다. */
export type FormParticipantType = 'TRAINEE' | 'STANDARD';

export type DynamicFormType = BuilderDynamicFormType | 'DEFAULT';

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
  /** 생략하면 생성은 null, 수정은 기존 값 유지. null 이면 해제한다(Form #164) */
  occupationOpenAt?: string | null;
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
  /**
   * 교원·예비교사 외 유형의 사전등록 시작 시각(ISO-8601 offset, Form #164). 전에는 교원·예비교사만 신청한다.
   * null 이거나 구형 응답(없음)이면 제한하지 않는다
   */
  occupationOpenAt?: string | null;
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

/** 행사별 프로그램용 폼 목록 항목(Expo-Form-Server#141). 문항·행사·용도는 담지 않는다 */
export interface ProgramFormListItemDto {
  id: string;
  title: string;
  participantType: FormParticipantType | null;
  startDate: string;
  endDate: string;
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
