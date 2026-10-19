import { ExhibitionFormData } from '@/shared/types/exhibition/type';

/** 정원 기본값은 둘 다 채우거나 둘 다 비워야 서버가 받는다. 문제가 없으면 null */
export const validatePreregisterCapacity = (
  data: Pick<
    ExhibitionFormData,
    'preregisterTeacherCapacity' | 'preregisterNonTeacherCapacity'
  >,
): string | null => {
  const { preregisterTeacherCapacity: t, preregisterNonTeacherCapacity: n } =
    data;
  if (t === '' && n === '') return null;
  if (t === '' || n === '')
    return '교사·예비교사 정원과 그 외 정원은 함께 입력해주세요.';
  if (!Number.isInteger(t) || !Number.isInteger(n) || t < 0 || n < 0)
    return '사전등록 정원은 0명 이상의 정수여야 합니다.';
  if (t + n < 1) return '사전등록 정원은 합계 1명 이상이어야 합니다.';
  return null;
};

/** 비운 값은 null 로 보내 미설정으로 둔다 */
export const toPreregisterCapacityBody = (
  data: Pick<
    ExhibitionFormData,
    'preregisterTeacherCapacity' | 'preregisterNonTeacherCapacity'
  >,
) => ({
  preregisterTeacherCapacity:
    data.preregisterTeacherCapacity === ''
      ? null
      : data.preregisterTeacherCapacity,
  preregisterNonTeacherCapacity:
    data.preregisterNonTeacherCapacity === ''
      ? null
      : data.preregisterNonTeacherCapacity,
});
