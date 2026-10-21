import { SCHOOL_OCCUPATIONS } from '@/entities/form/constants/occupationData';
import { isFieldVisible } from '@/shared/lib/form-conditional';
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
  isExcluded?: (form: DynamicFormItem) => boolean,
): Record<string, string | Companion[]> => {
  const occupationField = dynamicFormItems.find(
    (item) => item.dynamicFormType === 'OCCUPATION',
  );
  const occupation = occupationField && data[String(occupationField.id)];

  return dynamicFormItems.reduce<Record<string, string | Companion[]>>(
    (acc, form, index) => {
      // 조건 판정은 parentIndex 가 가리키는 전체 목록 기준이라 제외 문항도 목록에 남긴 채 건너뛴다
      if (isExcluded?.(form)) return acc;
      // 조건으로 숨겨진 문항에 남은 옛 값은 보내지 않는다(연쇄 조건 포함). 키는 유지해 빈 값으로 보낸다
      if (!isFieldVisible(dynamicFormItems, data, index)) {
        acc[form.title] = form.formType === 'COMPANION' ? [] : '';
        return acc;
      }
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
