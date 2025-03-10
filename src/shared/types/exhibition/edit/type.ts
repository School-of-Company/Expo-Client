import {
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { ExhibitionFormData } from '../create/type';

export interface AddressResponse {
  meta: {
    total_count: number;
  };
  documents: Array<{
    road_address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      road_name: string;
      underground_yn: string;
      main_building_no: string;
      sub_building_no: string;
      building_name: string;
      zone_no: string;
    };
    address: {
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      mountain_yn: string;
      main_address_no: string;
      sub_address_no: string;
      zip_code: string;
    };
  }>;
}

export interface EditExhibitionData {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: number;
  y: number;
  updateStandardProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
  }[];
  updateTrainingProRequestDto: {
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

export interface EditExhibitionData {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: number;
  y: number;
  updateStandardProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
  }[];
  updateTrainingProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
    category: 'ESSENTIAL' | 'CHOICE';
  }[];
}
