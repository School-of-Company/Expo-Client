import {
  OCCUPATION_OPTIONS,
  REGION_OPTIONS,
  SCHOOL_OCCUPATIONS,
} from '@/entities/form/constants/occupationData';
import type {
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';

const SCHOOL_MAX_LENGTH = 100;

const isOneOf = (options: readonly { key: string }[], value: unknown) =>
  options.some(({ key }) => key === value);

const isBlank = (value: unknown) =>
  value === undefined || (typeof value === 'string' && value.trim() === '');

/**
 * 신청 서비스(RegistrationWorkflow)가 사유 없이 400으로만 거절하는 답변 규칙을 제출 전에 확인한다.
 * 고칠 수 있는 첫 오류 문구를 돌려주고, 통과하면 undefined. 필수 입력은 렌더러가 이미 확인한다.
 */
export const findRegistrationAnswerError = (
  data: DynamicFormValues,
  items: DynamicFormItem[],
): string | undefined => {
  const valueOf = (item: DynamicFormItem) => data[String(item.id)];

  const occupationField = items.find(
    (item) => item.dynamicFormType === 'OCCUPATION',
  );
  const occupation = occupationField && valueOf(occupationField);
  if (
    occupationField &&
    !isBlank(occupation) &&
    !isOneOf(OCCUPATION_OPTIONS, occupation)
  ) {
    return `'${occupationField.title}' 항목을 다시 선택해주세요.`;
  }

  const regionField = items.find(
    (item) =>
      item.formType === 'REGION' &&
      !isBlank(valueOf(item)) &&
      !isOneOf(REGION_OPTIONS, valueOf(item)),
  );
  if (regionField) return `'${regionField.title}' 항목을 다시 선택해주세요.`;

  if (!SCHOOL_OCCUPATIONS.some((key) => key === occupation)) return undefined;
  const schoolField = items.find((item) => item.dynamicFormType === 'SCHOOL');
  // 신청서에 소속 학교 문항이 없으면 참가자가 고칠 수 없다. 운영자 설정 문제로 안내한다
  if (!schoolField) {
    return '이 신청서에는 소속 학교 문항이 없어 교사·예비교사로 신청할 수 없습니다. 박람회 운영자에게 문의해주세요.';
  }
  const school = valueOf(schoolField);
  if (isBlank(school)) {
    return `교사·예비교사는 '${schoolField.title}' 항목을 입력해야 합니다.`;
  }
  if (typeof school === 'string' && school.trim().length > SCHOOL_MAX_LENGTH) {
    return `'${schoolField.title}' 항목은 ${SCHOOL_MAX_LENGTH}자 이하로 입력해주세요.`;
  }
  return undefined;
};
