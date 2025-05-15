import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { deleteLogout } from '../api/deleteLogout';

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteLogout(),
    onSuccess: () => {
      toast.success('로그아웃이 완료되었습니다.');
      router.push('/signin');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
