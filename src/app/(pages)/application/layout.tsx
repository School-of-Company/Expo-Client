'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { ParticipantLogoutButton } from '@/features/phone-verification';

// 참가자 신청 화면 공통. 아래 경로의 [id] 는 모두 박람회 ID 다
export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id } = useParams<{ id?: string }>();

  return (
    <>
      {id && (
        <div className="mx-auto flex w-full max-w-[816px] justify-end px-16 pt-12 empty:hidden">
          <Suspense>
            <ParticipantLogoutButton expoId={id} />
          </Suspense>
        </div>
      )}
      {children}
    </>
  );
}
