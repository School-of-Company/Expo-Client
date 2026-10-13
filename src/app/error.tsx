'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/shared/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** 렌더링 중 예외가 나면 흰 화면 대신 보여 준다. 오류 내용은 화면에 띄우지 않는다 */
export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-screen w-full flex-col items-center justify-center gap-16 p-16"
    >
      <h1 className="text-h3b text-gray-700">문제가 발생했습니다</h1>
      <p className="break-keep text-center text-body2r text-gray-500">
        일시적인 오류일 수 있습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <div className="flex w-[320px] max-w-full gap-12">
        <Button variant="white" onClick={reset}>
          다시 시도
        </Button>
        <Link
          href="/"
          className="flex h-[50px] w-full items-center justify-center rounded-sm bg-main-600 text-body1b text-white"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
