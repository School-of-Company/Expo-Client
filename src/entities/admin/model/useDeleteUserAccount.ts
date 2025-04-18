import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { deleteUserAccount } from '../api/deleteUserAccount';

export const useDeleteUserAccount = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteUserAccount(),
    onSuccess: () => {
      toast.success('탈퇴가 완료되었습니다.');
      router.push('/signin');
    },
    onError: () => {
      toast.error('유저 탈퇴를 실패했습니다.');
    },
  });
};
