import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createForm, deleteForm, getForm, updateForm } from '../api/forms';
import { formKeys, programFormKeys } from '../api/keys';
import {
  createProgramForm,
  deleteProgramForm,
  getProgramForm,
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
  });

export const useCreateProgramFormMutation = (expoId: string) =>
  useMutation({
    mutationFn: (data: CreateProgramFormRequestDto) =>
      createProgramForm(expoId, data),
  });

export const useUpdateProgramFormMutation = (formId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProgramFormRequestDto) =>
      updateProgramForm(formId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: programFormKeys.detail(formId),
      }),
  });
};

export const useDeleteProgramFormMutation = (formId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProgramForm(formId),
    onSuccess: () =>
      queryClient.removeQueries({ queryKey: programFormKeys.detail(formId) }),
  });
};
