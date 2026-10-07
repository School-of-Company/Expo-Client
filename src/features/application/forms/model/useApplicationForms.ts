'use client';

import { useQueries } from '@tanstack/react-query';
import { getApplicationForm, getSurveyForm } from '@/shared/api';
import { ApplicationForm } from '@/shared/types/application/type';
import { FORM_ENTRIES, FormEntry } from '../constant/formEntries';

export interface ApplicationFormEntry extends FormEntry {
  form: ApplicationForm;
}

// ponytail: 신청 폼 목록 API 가 없어 조합별로 각각 조회한다.
// 백엔드에 "박람회의 신청 폼 목록" 엔드포인트가 생기면 단일 쿼리로 교체.
export const useApplicationForms = (expoId: string) => {
  const results = useQueries({
    queries: FORM_ENTRIES.map((entry) => ({
      queryKey: ['applicationFormEntry', expoId, entry.key],
      queryFn: () =>
        entry.formType === 'application'
          ? getApplicationForm(expoId, entry.userType, entry.applicationType)
          : getSurveyForm(expoId, entry.userType, entry.applicationType),
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
