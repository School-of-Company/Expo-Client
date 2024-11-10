import Link from 'next/link';
import React from 'react';

const SignupPrompt = () => {
  return (
    <div className="mt-[10px] flex gap-6">
      <p className="text-caption2 text-gray-300">
        아직 관리자 로그인을 안 하셨나요?
      </p>
      <Link href="/signup" className="text-caption2 text-gray-500">
        회원가입
      </Link>
    </div>
  );
};

export default SignupPrompt;
