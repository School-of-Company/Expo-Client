import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  createProgramForm,
  deleteProgramForm,
  editProgramForm,
  getProgramForm,
} from '@/features/form/program';
import { getRegistrationRoutes } from '@/shared/config';
import { isVersionConflict, reapplyMine } from './versionConflict';
import type {
  ProgramForm,
  ProgramFormMutationResult,
  ProgramFormRequest,
} from '@/shared/types/form/program/type';

export const programFormQueryKey = (formId: string) => ['programForm', formId];

export const useProgramFormQuery = (formId: string) =>
  useQuery({
    queryKey: programFormQueryKey(formId),
    queryFn: () => getProgramForm(formId),
  });

export const useCreateProgramForm = (expoId: string) => {
  const router = useRouter();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (body: ProgramFormRequest) => createProgramForm(expoId, body),
    onSuccess: ({ id }) => {
      toast.success('프로그램용 폼을 만들었습니다.');
      router.replace(getRegistrationRoutes(expoId).programForm(id));
    },
  });
  return { create: mutateAsync, isPending };
};

/**
 * 낙관적 락으로 저장한다. 캐시의 `version` 을 `expectedVersion` 으로 보내고, 성공하면 새 `version` 으로 캐시를 고친다.
 * FORM_VERSION_CONFLICT 는 오류로 던지지 않고 `conflict` 에 내 값을 남겨 모달이 고르게 한다.
 */
export const useEditProgramForm = (formId: string) => {
  const queryClient = useQueryClient();
  const queryKey = programFormQueryKey(formId);
  const [conflict, setConflict] = useState<ProgramFormRequest | null>(null);

  const { mutateAsync: patch, isPending } = useMutation({
    mutationFn: (body: Parameters<typeof editProgramForm>[1]) =>
      editProgramForm(formId, body),
  });

  const fetchLatest = () =>
    queryClient.fetchQuery({
      queryKey,
      queryFn: () => getProgramForm(formId),
      staleTime: 0,
    });

  const onSaved = ({ version }: ProgramFormMutationResult) => {
    queryClient.setQueryData<ProgramForm>(
      queryKey,
      (old) => old && { ...old, version },
    );
    // 응답에는 id·version 만 오므로 본문은 다시 받아 맞춘다. 편집 중인 값은 건드리지 않는다
    queryClient.invalidateQueries({ queryKey });
    setConflict(null);
    toast.success('저장했습니다.');
  };

  /** 충돌이 아닌 오류(제목 중복, 기간 축소 등)는 던져서 편집 화면이 필드 옆에 보여 준다. */
  const save = async (values: ProgramFormRequest) => {
    const expectedVersion =
      queryClient.getQueryData<ProgramForm>(queryKey)?.version;
    if (expectedVersion === undefined) return;
    try {
      onSaved(await patch({ ...values, expectedVersion }));
    } catch (error) {
      if (!isVersionConflict(error)) throw error;
      setConflict(values);
    }
  };

  const reapply = async () => {
    if (!conflict) return;
    try {
      onSaved(await reapplyMine(conflict, { fetchLatest, patch }));
    } catch (error) {
      // 또 충돌이면 모달을 그대로 두고 다시 고르게 한다
      if (!isVersionConflict(error)) setConflict(null);
      toast.error((error as Error).message);
    }
  };

  /** 내 변경을 버리고 최신본으로 바꾼다. 화면은 받은 최신본으로 편집기를 다시 그린다. */
  const reloadLatest = async () => {
    const latest = await fetchLatest();
    setConflict(null);
    return latest;
  };

  return {
    save,
    isPending,
    hasConflict: conflict !== null,
    reapply,
    reloadLatest,
  };
};

export const useDeleteProgramForm = (expoId: string, formId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteProgramForm(formId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: programFormQueryKey(formId) });
      toast.success('프로그램용 폼을 삭제했습니다.');
      router.replace(getRegistrationRoutes(expoId).schedule);
    },
    // PROGRAM_FORM_PROTECTION_PENDING 은 오류 문구가 이미 거절 이유를 안내한다
    onError: (error) => toast.error(error.message),
  });
  return { remove: mutate, isPending };
};
