import { SCHOOL_OCCUPATIONS } from '@/entities/form/constants/occupationData';
import {
  Companion,
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { processCompanions, processFormField } from './processFormField';
import { resolveFieldValue } from './resolveFieldValue';

// 신청 서비스가 코드로 검증하는 문항. 보기 문구가 아니라 선택지 키(Occupation·Region)를 그대로 보낸다
const isCodeField = (form: DynamicFormItem) =>
  form.dynamicFormType === 'OCCUPATION' || form.formType === 'REGION';

export const processDynamicFormData = (
  data: DynamicFormValues,
  dynamicFormItems: DynamicFormItem[],
): Record<string, string | Companion[]> => {
  const occupationField = dynamicFormItems.find(
    (item) => item.dynamicFormType === 'OCCUPATION',
  );
  const occupation = occupationField && data[String(occupationField.id)];

  return dynamicFormItems.reduce<Record<string, string | Companion[]>>(
    (acc, form) => {
      const raw = data[String(form.id)];
      if (form.formType === 'COMPANION') {
        acc[form.title] = processCompanions(raw);
        return acc;
      }
      if (isCodeField(form)) {
        acc[form.title] = typeof raw === 'string' ? raw : '';
        return acc;
      }
      // 소속 학교는 명찰에 찍히는 입력 그대로 보낸다. 직업을 교사·예비교사에서 바꿔 숨겨진 채 남은 값은 뺀다
      if (form.dynamicFormType === 'SCHOOL') {
        const needsSchool =
          !occupationField ||
          SCHOOL_OCCUPATIONS.some((key) => key === occupation);
        acc[form.title] =
          needsSchool && typeof raw === 'string' ? raw.trim() : '';
        return acc;
      }
      acc[form.title] = processFormField(
        form.title,
        resolveFieldValue(data, form),
        form.formType,
      );
      return acc;
    },
    {},
  );
};
