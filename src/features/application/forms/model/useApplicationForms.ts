'use client';

import { useQueries } from '@tanstack/react-query';
import { FormResponseDto, formKeys, getForm } from '@/entities/form';
import { getSurvey, surveyKeys, SurveyResponseDto } from '@/entities/survey';
import { FORM_ENTRIES, FormEntry } from '../constant/formEntries';

/** 설문 응답(SurveyResponseDto)에는 신청 기간(startDate·endDate)이 없다. */
export type ApplicationFormEntry = FormEntry & {
  form: FormResponseDto | SurveyResponseDto;
};

// 폼·설문 키를 그대로 써서 formKeys.expo·surveyKeys.expo 무효화에 목록도 함께 갱신된다
const entryKey = (expoId: string, entry: FormEntry) =>
  entry.formType === 'application'
    ? formKeys.detail(expoId, entry.userType, entry.applicationType)
    : surveyKeys.detail(expoId, entry.userType);

// ponytail: 신청 폼 목록 API 가 없어 조합별로 각각 조회한다.
// 백엔드에 "박람회의 신청 폼 목록" 엔드포인트가 생기면 단일 쿼리로 교체.
export const useApplicationForms = (expoId: string) => {
  const results = useQueries({
    queries: FORM_ENTRIES.map((entry) => ({
      queryKey: entryKey(expoId, entry),
      queryFn: () =>
        entry.formType === 'application'
          ? getForm(expoId, entry.userType, entry.applicationType)
          : getSurvey(expoId, entry.userType),
      retry: false,
      // 없는 조합은 실패가 정상이라 에러 토스트를 띄우지 않는다
      meta: { silent: true },
    })),
  });

  return {
    isLoading: results.some((result) => result.isLoading),
    // 존재하지 않는 조합은 조회가 실패하므로 그대로 제외한다
    forms: results.flatMap<ApplicationFormEntry>((result, index) =>
      result.data ? [{ ...FORM_ENTRIES[index], form: result.data }] : [],
    ),
  };
};
