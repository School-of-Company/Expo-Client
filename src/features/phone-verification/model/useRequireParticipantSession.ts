'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useParticipantSession } from './useParticipantSession';

/**
 * 참가자 세션이 없으면 휴대폰 인증 화면으로 보내고, 인증 뒤 지금 화면으로 돌아오게 한다.
 * 관리자로 로그인했어도 신청은 참가자 인증을 거친다. 신청 요청은 관리자 토큰을 싣지 않는다.
 * 세션을 확인하기 전이나 인증 화면으로 보내는 중에는 `isVerified` 가 false 다.
 */
export const useRequireParticipantSession = (expoId: string) => {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const { data, isError, isFetchedAfterMount, isFetching } =
    useParticipantSession(expoId, { alwaysRefetch: true });

  // 인증 전에 받아 둔 "세션 없음"으로 돌려보내지 않도록 이번에 새로 받은 결과로만 판단한다
  const isMissing =
    isFetchedAfterMount && !isFetching && data?.session === null;

  useEffect(() => {
    if (!isMissing) return;
    const redirect = query ? `${pathname}?${query}` : pathname;
    router.replace(
      `/phone-verification?expoId=${encodeURIComponent(expoId)}&redirect=${encodeURIComponent(redirect)}`,
    );
  }, [isMissing, expoId, pathname, query, router]);

  // 세션 조회 자체가 실패하면(5xx·네트워크) 막지 않는다. 제출할 때 서버가 다시 확인한다
  return {
    isVerified: (isFetchedAfterMount && !!data?.session) || isError,
  };
};
