import {
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { ExhibitionFormData } from './create/type';

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
