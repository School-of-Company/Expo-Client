import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { invalidateExpoPrograms, programQueryKeys } from '@/shared/queries';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import { Program } from '@/shared/types/program/list/type';
import {
  getEditConflictMessage,
  hasPendingProgramChange,
} from '../lib/getEditConflictMessage';
import { handleEditExhibitionFormSubmit } from '../lib/handleEditExhibitionFormSubmit';

const FALLBACK_MESSAGE = '박람회 수정 실패';

const hasRemoved = (
  before: Program[] | undefined,
  submitted: { id?: number }[],
) => {
  const submittedIds = new Set(submitted.map((program) => program.id));
  return (before ?? []).some((program) => !submittedIds.has(program.id));
};

export const useEditExhibitionMutation = (id: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const standardKey = programQueryKeys.standard(id);
  const trainingKey = programQueryKeys.training(id);

  const handleConflict = async (error: Error, data: ExhibitionFormData) => {
    // 다시 조회하기 전 목록으로 이번 요청에서 빠진 기존 프로그램이 있었는지 본다
    const hasRemovedProgram =
      hasRemoved(
        queryClient.getQueryData<Program[]>(standardKey),
        data.standard,
      ) ||
      hasRemoved(
        queryClient.getQueryData<Program[]>(trainingKey),
        data.trainings,
      );

    // 최신 pendingRevision을 받아 재시도 안내를 띄운다
    await Promise.all([
      queryClient.refetchQueries({ queryKey: standardKey }),
      queryClient.refetchQueries({ queryKey: trainingKey }),
    ]);

    const hasPendingChange = hasPendingProgramChange([
      ...(queryClient.getQueryData<Program[]>(standardKey) ?? []),
      ...(queryClient.getQueryData<Program[]>(trainingKey) ?? []),
    ]);

    toast.error(
      getEditConflictMessage({
        hasPendingChange,
        hasRemovedProgram,
        serverMessage:
          error.message !== FALLBACK_MESSAGE ? error.message : undefined,
      }),
    );
  };

  return useMutation({
    mutationFn: (data: ExhibitionFormData) =>
      handleEditExhibitionFormSubmit(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['expoList'],
      });
      queryClient.invalidateQueries({
        queryKey: ['expoDetail', id],
      });
      // 일정 화면의 프로그램 목록도 같은 revision 을 쓰므로 함께 다시 읽는다
      invalidateExpoPrograms(queryClient, id);

      router.push(`/exhibition/detail/${id}`);
      toast.success('박람회가 수정되었습니다.');
    },
    onError: (error: Error, data) => {
      if (getErrorStatus(error) === 409) {
        return handleConflict(error, data);
      }
      toast.error(error.message);
    },
  });
};
