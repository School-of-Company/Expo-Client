'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { SESSION_ISSUE_MESSAGE, SessionIssue } from '../../lib/sessionIssue';

/** 세션 문제 안내와 재인증 링크. 인증 뒤 지금 화면으로 돌아온다(입력값은 보관하지 않는다) */
const SessionNotice = ({
  expoId,
  issue,
}: {
  expoId: string;
  issue: SessionIssue;
}) => {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const redirect = query ? `${pathname}?${query}` : pathname;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-12 rounded-sm bg-gray-100 px-16 py-12"
    >
      <p className="break-keep text-body2r text-gray-700">
        {SESSION_ISSUE_MESSAGE[issue]}
      </p>
      <Link
        href={`/phone-verification?expoId=${encodeURIComponent(expoId)}&redirect=${encodeURIComponent(redirect)}`}
        className="whitespace-nowrap rounded-sm bg-main-600 px-16 py-8 text-caption1b text-white"
      >
        {issue === 'expired' ? '다시 인증하기' : '본인 인증하기'}
      </Link>
    </div>
  );
};

export default SessionNotice;
