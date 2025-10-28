import {
  Check,
  CheckBoxIcon,
  DropDown,
  MultipleChoice,
  Typing,
} from '@/shared/assets/icons';
import { Option } from '@/shared/types/form/create/type';

export const selectOptionData: Option[] = [
  { value: 'SENTENCE', label: '문장형', icon: <Typing /> },
  { value: 'CHECKBOX', label: '체크박스', icon: <CheckBoxIcon /> },
  { value: 'DROPDOWN', label: '드롭다운', icon: <DropDown /> },
  { value: 'MULTIPLE', label: '객관식', icon: <MultipleChoice /> },
  { value: 'PRIVACYCONSENT', label: '개인정보 동의', icon: <Check /> },
];
