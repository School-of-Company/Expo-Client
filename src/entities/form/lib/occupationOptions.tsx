'use client';

import { createContext, useContext } from 'react';
import { OCCUPATION_OPTIONS } from '../constants/occupationData';
import type { DynamicFormItem } from '@/shared/types/application/type';

/** 폼 정의의 직업 문항 선택지(키 → 라벨). 문항이 없으면 undefined */
export const getOccupationLabels = (
  items: Pick<DynamicFormItem, 'dynamicFormType' | 'jsonData'>[] | undefined,
): Record<string, string> | undefined => {
  const question = items?.find((item) => item.dynamicFormType === 'OCCUPATION');
  if (!question) return undefined;
  return Object.fromEntries(
    Object.entries(question.jsonData).map(([key, option]) => [
      key,
      typeof option === 'string' ? option : option.value,
    ]),
  );
};

/**
 * 동행자 구분 선택지. 본인 신청 폼과 같은 문구가 보이도록 폼 정의의 직업 선택지를 따른다.
 * 폼 정의에 없는 키는 내보내지 않고, 정의가 없으면 클라이언트 상수 그대로 쓴다
 */
export const toOccupationOptions = (labels?: Record<string, string>) =>
  labels
    ? OCCUPATION_OPTIONS.filter(({ key }) => key in labels).map(({ key }) => ({
        key,
        label: labels[key],
      }))
    : OCCUPATION_OPTIONS;

const OccupationLabelsContext = createContext<
  Record<string, string> | undefined
>(undefined);

export const OccupationLabelsProvider = OccupationLabelsContext.Provider;

export const useOccupationOptions = () =>
  toOccupationOptions(useContext(OccupationLabelsContext));
