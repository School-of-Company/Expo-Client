import { SCHOOL_OCCUPATIONS } from '@/entities/form/constants/occupationData';
import { Companion } from '@/shared/types/application/type';

export const processFormField = (
  title: string,
  value: unknown,
  formType: string,
): string => {
  if (
    value === undefined ||
    value === null ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return '';
  }

  if (formType === 'CHECKBOX' || formType === 'MULTIPLE') {
    const selectedOptions = Array.isArray(value) ? value : [value];
    return selectedOptions.map(String).join(', ');
  }

  return String(value || '').toUpperCase();
};

/** 동행자 답변을 정리한다. 이름·소속 공백을 걷고, 소속이 필요 없는 구분이면 소속을 뺀다(Form이 거부한다). */
export const processCompanions = (value: unknown): Companion[] =>
  (Array.isArray(value) ? (value as Companion[]) : []).map(
    ({ name, occupation, region, school }) => ({
      name: name.trim(),
      occupation,
      region,
      ...(SCHOOL_OCCUPATIONS.some((key) => key === occupation) && {
        school: school?.trim(),
      }),
    }),
  );
