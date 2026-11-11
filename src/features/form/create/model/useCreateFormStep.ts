import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createForm, CreateFormRequestDto } from '@/entities/form';
import { createSurvey, CreateSurveyRequestDto } from '@/entities/survey';
import { FormValues } from '@/shared/types/form/create/type';
import { transformFormData } from '../../common/model/formUtils';
import {
  FormCreateApplicationType,
  FormCreateUserType,
} from './formCreateQuery';

/** 박람회 생성 2단계에서 한 번에 고를 수 있는 폼 하나 */
export type FormStepKind =
  | {
      mode: 'application';
      userType: FormCreateUserType;
      applicationType: FormCreateApplicationType;
    }
  | { mode: 'survey'; userType: FormCreateUserType };

interface SubmitOptions {
  /** 등록용 폼만 쓴다(ISO) */
  startDate?: string;
  endDate?: string;
  /** 일반 사전등록만 넘긴다. 생략하면 요청에서도 뺀다 */
  occupationOpenAt?: string | null;
}

/**
 * 박람회 생성 2단계에서 폼 하나를 만든다. 폼 작성 화면과 달리 저장 뒤 다른 화면으로 옮기지 않아
 * 같은 화면에서 다음 폼을 이어서 만들 수 있다
 */
export const useCreateFormStep = (expoId: string, kind: FormStepKind) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      values,
      options,
    }: {
      values: FormValues;
      options: SubmitOptions;
    }) => {
      if (kind.mode === 'survey') {
        const data = transformFormData(
          values,
          kind.userType,
          'survey',
          'PRE',
          '',
          '',
        );
        return createSurvey(expoId, data as CreateSurveyRequestDto);
      }
      const data = transformFormData(
        values,
        kind.userType,
        'application',
        kind.applicationType,
        options.startDate ?? '',
        options.endDate ?? '',
        options.occupationOpenAt,
      );
      return createForm(expoId, data as CreateFormRequestDto);
    },
    onSuccess: () => {
      // 박람회 목록·상세의 폼·설문 생성 여부가 바뀐다
      queryClient.invalidateQueries({ queryKey: ['expoValid'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const submit = (values: FormValues, options: SubmitOptions = {}) =>
    mutation.mutateAsync({ values, options });

  return {
    submit,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
};
