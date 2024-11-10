'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { signIn } from '../../api/signin';
import { showError } from '../../model/showError';

type FormData = {
  nickname: string;
  password: string;
};

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>();

  const router = useRouter();

  return (
    <form
      onSubmit={handleSubmit(
        (data) => signIn(data, router),
        (errors) => {
          const firstError = Object.values(errors)[0];
          if (firstError && firstError.message) {
            showError(firstError.message as string);
          }
        },
      )}
    >
      <div className="space-y-6">
        <p className="text-h4 text-black">아이디</p>
        <Input
          {...register('nickname', { required: '아이디를 입력해주세요.' })}
          type="text"
          placeholder="아이디를 입력해주세요."
        />
        <p className="text-h4 text-black">비밀번호</p>
        <Input
          {...register('password', {
            required: '비밀번호를 입력해주세요.',
            pattern: {
              value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/,
              message:
                '비밀번호는 8자리 이상, 대문자 1개, 특수문자 1개 이상을 포함해야 합니다.',
            },
          })}
          placeholder="비밀번호를 입력해주세요."
          type="password"
        />
      </div>
      <div className="mt-[160px]">
        <Button disabled={isSubmitting} type="submit" text="로그인" />
      </div>
    </form>
  );
};

export default SignInForm;
