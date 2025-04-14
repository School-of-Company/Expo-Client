import {
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { ExhibitionFormData } from '../type';

export interface CreateExhibitionData {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: number;
  y: number;
  addStandardProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
  }[];
  addTrainingProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
    category: 'ESSENTIAL' | 'CHOICE';
  }[];
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

export interface ModalProps {
  setModal: (value: boolean) => void;
  setValue: UseFormSetValue<ExhibitionFormData>;
  watch: UseFormWatch<ExhibitionFormData>;
  index: number;
  fieldName: 'trainings' | 'standard';
}

export interface CreateExhibitionData {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: number;
  y: number;
  addStandardProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
  }[];
  addTrainingProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
    category: 'ESSENTIAL' | 'CHOICE';
  }[];
}
