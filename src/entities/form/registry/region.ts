import { REGION_TREE } from '../constants/regionData';
import type { FieldModel } from './types';

/** 지역 답변의 폼 값. 시/도를 바꾸면 시/군/구는 비운다. */
export interface RegionValue {
  sido: string;
  sigungu: string;
}

/** 값이 비었으면 `null`, 데이터에 없는 조합이면 `false`, 다 골랐으면 `true`. */
export const checkRegion = (value?: Partial<RegionValue>) => {
  const sido = value?.sido ?? '';
  const sigungu = value?.sigungu ?? '';
  if (!sido) return null;
  const children = REGION_TREE[sido];
  if (!children) return false;
  if (children.length === 0) return true;
  if (!sigungu) return null;
  return children.includes(sigungu);
};

export const regionModel: FieldModel<RegionValue> = {
  validate: (value, item) => {
    const result = checkRegion(value);
    if (result === false) return '지역을 다시 선택해주세요';
    if (result === null && value?.sido) return '시/군/구를 선택해주세요';
    if (result === null && item.requiredStatus) return '지역을 선택해주세요';
    return true;
  },
  // 서버에는 "광주광역시 북구"처럼 이어 붙여 보낸다. 하위 단계가 없으면 시/도만.
  // 비었으면 `undefined` — Form은 선택 문항에 빈 문자열을 받지 않는다(키를 빼야 한다).
  serialize: (value) =>
    checkRegion(value)
      ? [value!.sido, value!.sigungu].filter(Boolean).join(' ')
      : undefined,
};
