import Link from 'next/link';

import { LineStroke } from '@/shared/assets/svg';

const SignupPrompt = () => {
  return (
    <div className="mt-[10px] flex items-center gap-16">
      <p className="text-caption1r text-gray-300">
        아직 관리자 로그인을 안 하셨나요?
      </p>
      <LineStroke />
      <Link href="/signup" className="text-caption1r text-main-600">
        회원가입
      </Link>
    </div>
  );
};

export default SignupPrompt;
