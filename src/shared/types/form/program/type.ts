import { DynamicFormItem } from '../../application/type';
import { DynamicFieldRequest } from '../create/type';

/**
 * 프로그램용 폼(Form 서비스 `purpose: "PROGRAM"`).
 * `participantType` 은 `null` 일 수 있다. 대상 역할은 박람회 서비스의 회차가 정한다.
 */
export interface ProgramForm {
  id: string;
  expoId: string;
  title: string;
  informationText: string;
  participantType: 'STANDARD' | 'TRAINEE' | null;
  startDate: string;
  endDate: string;
  dynamicForm: DynamicFormItem[];
  purpose: 'PROGRAM';
  version: number;
}

export interface ProgramFormRequest {
  title: string;
  informationText: string;
  /** 생략하거나 `null` 이면 대상을 정하지 않는다. */
  participantType?: 'STANDARD' | 'TRAINEE' | null;
  startDate: string;
  endDate: string;
  dynamicForm: DynamicFieldRequest[];
}

/** 수정은 폼을 불러온 시점의 `version` 을 반드시 담는다. */
export type ProgramFormPatchRequest = Partial<ProgramFormRequest> & {
  expectedVersion: number;
};

/** 생성·수정 응답. 이어서 고칠 때 이 `version` 을 `expectedVersion` 으로 쓴다. */
export interface ProgramFormMutationResult {
  id: string;
  version: number;
}
