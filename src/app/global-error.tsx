'use client';

import '../shared/styles/globals.css';
import { pretendard } from '@/shared/styles/fonts';
import ErrorPage from './error';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** 루트 레이아웃까지 깨졌을 때 레이아웃 대신 그려지므로 html·body를 직접 둔다 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-Pretendard">
        <ErrorPage error={error} reset={reset} />
      </body>
    </html>
  );
}
