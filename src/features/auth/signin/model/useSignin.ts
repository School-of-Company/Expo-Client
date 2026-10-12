import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { SignInData } from '@/shared/types/signin/type';
import { postSignin, SigninError } from '../api/postSignin';

// 잠금 시간은 서버 설정이라 Retry-After가 없을 때만 쓰는 짧은 재시도 대기 시간이다.
const DEFAULT_LOCK_SECONDS = 30;

export const useSignin = () => {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(lockTimerRef.current), []);

  const lock = (seconds: number) => {
    clearTimeout(lockTimerRef.current);
    setIsLocked(true);
    lockTimerRef.current = setTimeout(() => setIsLocked(false), seconds * 1000);
  };

  const mutation = useMutation({
    mutationFn: (data: SignInData) => postSignin(data),
    onSuccess: () => {
      toast.success('로그인이 완료되었습니다.');
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error(error.message);
      if (error instanceof SigninError && error.status === 429) {
        lock(error.retryAfterSeconds ?? DEFAULT_LOCK_SECONDS);
      }
    },
  });

  return { ...mutation, isLocked };
};
