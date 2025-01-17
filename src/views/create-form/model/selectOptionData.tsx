import {
  CheckBoxIcon,
  DropDown,
  FormPicture,
  MultipleChoic,
  Typing,
} from '@/shared/assets/icons';
import { Option } from '@/shared/types/create-form/type';

export const selectOptionData: Option[] = [
  { value: 'text', label: '문장형', icon: <Typing /> },
  { value: 'checkbox', label: '체크박스', icon: <CheckBoxIcon /> },
  { value: 'dropdown', label: '드롭다운', icon: <DropDown /> },
  { value: 'multiple-choice', label: '객관식', icon: <MultipleChoic /> },
  { value: 'image', label: '이미지', icon: <FormPicture /> },
];
