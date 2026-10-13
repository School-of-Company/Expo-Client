import { format } from 'date-fns';
import type { DynamicFormItem } from '@/shared/types/application/type';
import type {
  ProgramForm,
  ProgramFormRequest,
} from '@/shared/types/form/program/type';

/** 편집 화면 값. 기간은 `<input type="datetime-local">` 형식(로컬 시각)으로 들고 있는다. */
export interface ProgramFormValues {
  title: string;
  informationText: string;
  /** 빈 문자열이면 대상을 정하지 않는다(서버에는 `null`). */
  participantType: 'STANDARD' | 'TRAINEE' | '';
  startDate: string;
  endDate: string;
  /** FormBuilder 가 다루는 모양 그대로 둔다. 보낼 때 `id` 를 떼고 `DEFAULT` 를 붙인다. */
  dynamicForm: DynamicFormItem[];
}

const toLocalInput = (iso: string) =>
  format(new Date(iso), "yyyy-MM-dd'T'HH:mm");

export const EMPTY_PROGRAM_FORM_VALUES: ProgramFormValues = {
  title: '',
  informationText: '',
  participantType: '',
  startDate: '',
  endDate: '',
  dynamicForm: [],
};

export const toProgramFormValues = (form: ProgramForm): ProgramFormValues => ({
  title: form.title,
  informationText: form.informationText,
  participantType: form.participantType ?? '',
  startDate: toLocalInput(form.startDate),
  endDate: toLocalInput(form.endDate),
  dynamicForm: form.dynamicForm,
});

/**
 * 화면 값을 요청으로 바꾼다. `base` 는 불러온 폼이다.
 * datetime-local 은 분 단위라 초·밀리초가 잘린다. 서버는 기존 값보다 늦은 시작·이른 종료를 기간 축소로 보고
 * PROGRAM_FORM_PROTECTION_PENDING 으로 거절하므로, 손대지 않은 일시는 원래 값을 그대로 보낸다.
 */
export const toProgramFormRequest = (
  values: ProgramFormValues,
  base?: Pick<ProgramForm, 'startDate' | 'endDate'>,
): ProgramFormRequest => {
  const toIso = (local: string, original?: string) =>
    original && toLocalInput(original) === local
      ? original
      : new Date(local).toISOString();

  return {
    title: values.title.trim(),
    informationText: values.informationText,
    participantType: values.participantType || null,
    startDate: toIso(values.startDate, base?.startDate),
    endDate: toIso(values.endDate, base?.endDate),
    dynamicForm: values.dynamicForm.map(
      ({ title, formType, jsonData, requiredStatus, otherJson }) => ({
        title,
        formType,
        jsonData,
        requiredStatus,
        otherJson,
        dynamicFormType: 'DEFAULT',
      }),
    ),
  };
};
