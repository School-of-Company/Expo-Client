import {
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import type { DynamicFormItem } from '@/shared/types/application/type';

/**
 * 생성 화면에서 회차마다 정하는 온라인 신청(모집 정책). 일시는 로컬 'YYYY-MM-DDTHH:mm' 이다.
 * 신청 폼은 박람회를 만든 뒤에 생기므로 여기에는 없고, 저장할 때 구분별 폼을 만들어 연결한다
 */
export interface ProgramPolicyDraft {
  applicationStartedAt: string | null;
  applicationEndedAt: string | null;
  cancelEndedAt: string | null;
  promotionEndedAt: string | null;
  preRegistrationCapacity: number;
  waitingCapacity: number;
  /** AdminOccupation 값 */
  allowedOccupations: string[];
}

/** 생성 화면에서 구분별로 하나씩 만드는 신청 폼의 내용 */
export interface ProgramFormDraft {
  informationText: string;
  dynamicForm: DynamicFormItem[];
}

export type ExhibitionFormData = {
  title: string;
  introduction: string;
  address: string;
  location: string;
  trainings: {
    id?: number;
    revision?: number;
    title: string;
    startedAt: string;
    endedAt: string;
    place?: string;
    category?: 'ESSENTIAL' | 'CHOICE';
    /** 생성 화면에서만 쓴다. 없거나 null 이면 온라인 신청을 받지 않는다 */
    policy?: ProgramPolicyDraft | null;
  }[];
  standard: {
    id?: number;
    revision?: number;
    title: string;
    startedAt: string;
    endedAt: string;
    place?: string;
    policy?: ProgramPolicyDraft | null;
  }[];
  /** 생성 화면에서만 쓴다. 온라인 신청을 받는 회차가 있는 구분만 폼을 만든다 */
  programForms: Record<'STANDARD' | 'TRAINING', ProgramFormDraft>;
  image: File | null | string;
  startedDay: string;
  finishedDay: string;
  /** 입력칸을 비우면 '' 이다. 둘 다 비우거나 둘 다 채운다 */
  preregisterTeacherCapacity: number | '';
  preregisterNonTeacherCapacity: number | '';
};

export interface MutationType {
  mutate: (data: ExhibitionFormData) => void;
  isPending: boolean;
  isSuccess: boolean;
}

export interface FieldArrayProps {
  fields: UseFieldArrayReturn<
    ExhibitionFormData,
    'trainings' | 'standard',
    'id'
  >['fields'];
  append: UseFieldArrayReturn<
    ExhibitionFormData,
    'trainings' | 'standard',
    'id'
  >['append'];
  remove: UseFieldArrayReturn<
    ExhibitionFormData,
    'trainings' | 'standard',
    'id'
  >['remove'];
  register: UseFormRegister<ExhibitionFormData>;
  setValue: UseFormSetValue<ExhibitionFormData>;
  watch: UseFormWatch<ExhibitionFormData>;
  fieldName: 'trainings' | 'standard';
  /** 켜면 회차마다 온라인 신청(모집 정책)을 함께 입력한다. 생성 화면만 켠다 */
  withPolicy?: boolean;
}

export type ProgramItem = ExhibitionFormData['trainings'][number];

export interface ModalProps {
  fieldName: 'trainings' | 'standard';
  /** 있으면 수정, 없으면 추가 */
  initial?: ProgramItem;
  withPolicy?: boolean;
  onSubmit: (item: ProgramItem) => void;
  onClose: () => void;
}

export const Application = {
  PRE: '사전',
  FIELD: '현장',
} as const;

export type ApplicationType = keyof typeof Application;
