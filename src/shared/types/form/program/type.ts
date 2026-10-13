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

/**
 * 수정은 메타데이터를 갱신하고 입력 필드를 통째로 교체하므로 전체를 보낸다.
 * `expectedVersion` 은 폼을 불러온 시점의 `version` 이고, 빠지면 서버가 400 으로 거절한다.
 */
export type ProgramFormPatchRequest = ProgramFormRequest & {
  expectedVersion: number;
};

/** 생성·수정 응답. 이어서 고칠 때 이 `version` 을 `expectedVersion` 으로 쓴다. */
export interface ProgramFormMutationResult {
  id: string;
  version: number;
}
