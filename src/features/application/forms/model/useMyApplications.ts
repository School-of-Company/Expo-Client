'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { deleteMyParticipant, getMyApplications } from '../api/myApplications';

export const useMyApplications = (expoId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['myApplications', expoId];

  const { data = [] } = useQuery({
    queryKey,
    queryFn: () => getMyApplications(expoId),
    retry: false,
    // 인증 전이거나 신청 내역이 없으면 실패가 정상이라 토스트를 띄우지 않는다
    meta: { silent: true },
  });

  const { mutate: cancel } = useMutation({
    mutationFn: deleteMyParticipant,
    onSuccess: () => {
      toast.success('신청이 취소되었습니다.');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { applications: data, cancel };
};
