import {
  COMPANION_MAX_COUNT,
  SCHOOL_OCCUPATIONS,
} from '../constants/occupationData';
import { regionModel, type RegionValue } from './region';
import type { FieldModel } from './types';
import type {
  Companion,
  DynamicFormItem,
} from '@/shared/types/application/type';

/** 동행자 한 명의 폼 값. 지역은 2단계 선택이라 객체로 들고 있다가 제출할 때 문자열로 바꾼다. */
export interface CompanionValue {
  name: string;
  occupation: string;
  region: RegionValue;
  school?: string;
}

/**
 * 서버 폼 정의에는 최소 인원이 없어 필수면 1명, 아니면 0명.
 * 최대는 `otherJson.maxSelection`이고 어느 쪽이든 `COMPANION_MAX_COUNT`를 넘지 않는다(Form `answer-spec.schema.ts`).
 */
export const companionCountRange = (item: DynamicFormItem) => ({
  min: item.requiredStatus ? 1 : 0,
  max: Math.min(
    item.otherJson?.maxSelection ?? COMPANION_MAX_COUNT,
    COMPANION_MAX_COUNT,
  ),
});

const needsSchool = (occupation: string) =>
  SCHOOL_OCCUPATIONS.some((key) => key === occupation);

const checkCompanion = ({
  name,
  occupation,
  region,
  school,
}: CompanionValue) => {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) return '동행자 이름을 입력해주세요';
  if (trimmed.length > 10) return '이름은 10자 이하입니다';
  if (!occupation) return '구분을 선택해주세요';
  const regionResult = regionModel.validate(region, {
    requiredStatus: true,
  } as DynamicFormItem);
  if (regionResult !== true) return regionResult;
  if (needsSchool(occupation)) {
    const schoolName = school?.trim() ?? '';
    if (!schoolName) return '소속을 입력해주세요';
    if (schoolName.length > 100) return '소속은 100자 이하입니다';
  }
  return true;
};

export const companionModel: FieldModel<CompanionValue[]> = {
  validate: (value, item) => {
    const list = value ?? [];
    const { min, max } = companionCountRange(item);
    if (list.length < min)
      return `${item.title}을(를) ${min}명 이상 추가해주세요`;
    if (list.length > max) return `동행자는 최대 ${max}명입니다`;
    for (let index = 0; index < list.length; index += 1) {
      const result = checkCompanion(list[index]);
      if (result !== true) return `동행자 ${index + 1}: ${result}`;
    }
    return true;
  },
  // 공백을 걷고, 소속이 필요 없는 구분이면 소속을 뺀다(Form이 거부한다).
  serialize: (value, item): Companion[] =>
    (value ?? []).map(({ name, occupation, region, school }) => ({
      name: name.trim(),
      occupation,
      region: regionModel.serialize(region, item) as string,
      ...(needsSchool(occupation) && { school: school?.trim() }),
    })),
};
