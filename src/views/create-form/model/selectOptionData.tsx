import {
  CheckBoxIcon,
  DropDown,
  FormPicture,
  MultipleChoic,
  Typing,
} from '@/shared/assets/icons';
import { Option } from '@/shared/types/create-form/type';

export const selectOptionData: Option[] = [
  { value: '문장형', label: '문장형', icon: <Typing /> },
  { value: '체크박스', label: '체크박스', icon: <CheckBoxIcon /> },
  { value: '드롭다운', label: '드롭다운', icon: <DropDown /> },
  { value: '객관식', label: '객관식', icon: <MultipleChoic /> },
  { value: '이미지', label: '이미지', icon: <FormPicture /> },
];
