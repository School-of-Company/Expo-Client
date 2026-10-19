import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { SignInData } from '@/shared/types/signin/type';
import { postSignin, SigninError } from '../api/postSignin';

// 서버는 같은 닉네임으로 여러 번 실패하면 분 단위로 잠그므로 남은 시간을 분으로 올려 안내한다
const toLockMessage = (seconds?: number) =>
  seconds
    ? `로그인 시도가 너무 많습니다. ${
        seconds < 60 ? `${seconds}초` : `${Math.ceil(seconds / 60)}분`
      } 후 다시 시도해 주세요.`
    : '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.';

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
      router.push('/admin');
    },
    onError: (error: Error) => {
      if (error instanceof SigninError && error.status === 429) {
        toast.error(toLockMessage(error.retryAfterSeconds));
        // 서버 잠금은 실패 횟수에 따라 길어지는데 Retry-After 가 없으면 길이를 모르므로 버튼은 잠그지 않는다
        if (error.retryAfterSeconds) lock(error.retryAfterSeconds);
        return;
      }
      toast.error(error.message);
    },
  });

  return { ...mutation, isLocked };
};
