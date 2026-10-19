import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  getProgramForm,
  programFormKeys,
  useCreateProgramFormMutation,
  useUpdateProgramFormMutation,
} from '@/entities/form';
import { getRegistrationRoutes } from '@/shared/config';
import { isVersionConflict, reapplyMine } from './versionConflict';
import type {
  CreateProgramFormRequestDto,
  ProgramFormResponseDto,
  ProgramFormVersionResponseDto,
} from '@/entities/form';

/** `onCreated` 가 없으면 만든 폼의 편집 화면으로 간다 */
export const useCreateProgramForm = (
  expoId: string,
  onCreated?: (formId: string) => void,
) => {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateProgramFormMutation(expoId);

  const create = async (body: CreateProgramFormRequestDto) => {
    const { id } = await mutateAsync(body);
    toast.success('프로그램용 폼을 만들었습니다.');
    if (onCreated) onCreated(id);
    else router.replace(getRegistrationRoutes(expoId).programForm(id));
  };

  return { create, isPending };
};

/**
 * 낙관적 락으로 저장한다. 편집기를 그린 시점의 폼(`base`)을 따로 들고 그 `version` 을 `expectedVersion` 으로 보낸다.
 * 쿼리 캐시는 포커스·무효화로 다시 받아질 수 있어서, 캐시 version 을 쓰면 남의 수정을 409 없이 덮어쓴다.
 * `base` 는 최신본을 불러올 때와 저장에 성공할 때만 바뀐다.
 * FORM_VERSION_CONFLICT 는 오류로 던지지 않고 `conflict` 에 내 값을 남겨 모달이 고르게 한다.
 */
export const useEditProgramForm = (initial: ProgramFormResponseDto) => {
  const formId = initial.id;
  const queryClient = useQueryClient();
  const [base, setBase] = useState(initial);
  const [conflict, setConflict] = useState<CreateProgramFormRequestDto | null>(
    null,
  );
  const { mutateAsync: patch, isPending } =
    useUpdateProgramFormMutation(formId);

  const fetchLatest = () =>
    queryClient.fetchQuery({
      queryKey: programFormKeys.detail(formId),
      queryFn: () => getProgramForm(formId),
      staleTime: 0,
    });

  // 보낸 값이 새 기준이 된다. 기간도 바꿔야 다음 저장에서 손대지 않은 기간을 그대로 보낸다
  const onSaved = (
    values: CreateProgramFormRequestDto,
    { version }: ProgramFormVersionResponseDto,
  ) => {
    setBase((prev) => ({
      ...prev,
      startDate: values.startDate,
      endDate: values.endDate,
      version,
    }));
    setConflict(null);
    toast.success('저장했습니다.');
  };

  /** 충돌이 아닌 오류(제목 중복, 기간 축소 등)는 던져서 편집 화면이 필드 옆에 보여 준다. */
  const save = async (values: CreateProgramFormRequestDto) => {
    try {
      onSaved(
        values,
        await patch({ ...values, expectedVersion: base.version }),
      );
    } catch (error) {
      if (!isVersionConflict(error)) throw error;
      setConflict(values);
    }
  };

  const reapply = async () => {
    if (!conflict) return;
    try {
      onSaved(conflict, await reapplyMine(conflict, { fetchLatest, patch }));
    } catch (error) {
      // 또 충돌이면 모달을 그대로 두고 다시 고르게 한다
      if (!isVersionConflict(error)) setConflict(null);
      // 저장 실패 사유는 길어서 기본 2초로는 읽기 어렵다
      toast.error((error as Error).message, { autoClose: 6000 });
    }
  };

  /** 내 변경을 버리고 최신본을 새 기준으로 삼는다. 화면은 이 값으로 편집기를 다시 그린다. */
  const reloadLatest = async () => {
    setBase(await fetchLatest());
    setConflict(null);
  };

  return {
    base,
    save,
    isPending,
    hasConflict: conflict !== null,
    reapply,
    reloadLatest,
  };
};
