import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createForm, deleteForm, getForm, updateForm } from '../api/forms';
import { formKeys, programFormKeys } from '../api/keys';
import {
  createProgramForm,
  deleteProgramForm,
  getProgramForm,
  getProgramFormList,
  updateProgramForm,
} from '../api/programForms';
import type {
  ApplicationType,
  CreateFormRequestDto,
  CreateProgramFormRequestDto,
  FormParticipantType,
  UpdateFormRequestDto,
  UpdateProgramFormRequestDto,
} from './types';

/** 토스트·이동은 호출부가 `mutate(data, { onSuccess })`로 붙인다. 여기서는 캐시만 맞춘다. */

export const useFormQuery = (
  expoId: string,
  participantType: FormParticipantType,
  applicationType: ApplicationType,
  { admin = false }: { admin?: boolean } = {},
) =>
  useQuery({
    queryKey: [
      ...formKeys.detail(expoId, participantType, applicationType),
      { admin },
    ],
    queryFn: () => getForm(expoId, participantType, applicationType, { admin }),
  });

export const useCreateFormMutation = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormRequestDto) => createForm(expoId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: formKeys.expo(expoId) }),
  });
};

export const useUpdateFormMutation = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFormRequestDto) => updateForm(expoId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: formKeys.expo(expoId) }),
  });
};

export const useDeleteFormMutation = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      participantType,
      applicationType,
    }: {
      participantType: FormParticipantType;
      applicationType: ApplicationType;
    }) => deleteForm(expoId, participantType, applicationType),
    onSuccess: (_, { participantType, applicationType }) =>
      queryClient.removeQueries({
        queryKey: formKeys.detail(expoId, participantType, applicationType),
      }),
  });
};

export const useProgramFormQuery = (formId: string) =>
  useQuery({
    queryKey: programFormKeys.detail(formId),
    queryFn: () => getProgramForm(formId),
    // 회차에서 아직 폼을 고르지 않았으면 빈 ID 다
    enabled: Boolean(formId),
  });

/**
 * 여러 프로그램 폼을 ID 로 한꺼번에 읽는다. 행사별 목록 API 가 없어(Expo-Form-Server#141)
 * 회차에 연결된 폼처럼 ID 를 이미 아는 폼만 읽는다. 순서는 넘긴 ID 순서와 같다
 */
export const useProgramFormsQuery = (formIds: string[]) =>
  useQueries({
    queries: formIds.map((formId) => ({
      queryKey: programFormKeys.detail(formId),
      queryFn: () => getProgramForm(formId),
    })),
  });

/** 회차에 아직 연결하지 않은 폼까지 이 행사의 프로그램용 폼 전체. 문항은 상세 조회로 읽는다 */
export const useProgramFormListQuery = (expoId: string) =>
  useQuery({
    queryKey: programFormKeys.list(expoId),
    queryFn: () => getProgramFormList(expoId),
  });

export const useCreateProgramFormMutation = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProgramFormRequestDto) =>
      createProgramForm(expoId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: programFormKeys.list(expoId),
      }),
  });
};

export const useUpdateProgramFormMutation = (formId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProgramFormRequestDto) =>
      updateProgramForm(formId, data),
    // 목록에도 제목·대상·기간·버전이 있어 함께 갱신한다. 폼만으로는 행사를 몰라 목록 전체를 무효화한다
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: programFormKeys.detail(formId),
        }),
        queryClient.invalidateQueries({ queryKey: programFormKeys.lists() }),
      ]),
  });
};

export const useDeleteProgramFormMutation = (formId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProgramForm(formId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: programFormKeys.detail(formId) });
      return queryClient.invalidateQueries({
        queryKey: programFormKeys.lists(),
      });
    },
  });
};
