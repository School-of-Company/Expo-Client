import {
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

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
  }[];
  standard: {
    id?: number;
    revision?: number;
    title: string;
    startedAt: string;
    endedAt: string;
    place?: string;
  }[];
  image: File | null | string;
  startedDay: string;
  finishedDay: string;
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
}

export type ProgramItem = ExhibitionFormData['trainings'][number];

export interface ModalProps {
  fieldName: 'trainings' | 'standard';
  /** 있으면 수정, 없으면 추가 */
  initial?: ProgramItem;
  onSubmit: (item: ProgramItem) => void;
  onClose: () => void;
}

export const Application = {
  PRE: '사전',
  FIELD: '현장',
} as const;

export type ApplicationType = keyof typeof Application;
