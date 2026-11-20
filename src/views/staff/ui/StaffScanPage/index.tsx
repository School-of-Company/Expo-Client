'use client';

import { useEffect, useMemo, useState } from 'react';
import { StaffCheckInPanel } from '@/features/exhibition/check-in';
import { StaffProgramScanPanel } from '@/features/program/detail';
import { normalizeExpoId } from '@/shared/config';
import { ScanHttpProvider } from '@/shared/libs/http/ScanHttpContext';
import { createStaffInstance } from '@/shared/libs/http/staffInstance';
import {
  createStaffSession,
  STAFF_LINK_INVALID_MESSAGE,
} from '@/shared/libs/http/staffSession';

type Tab = 'entry' | 'program';

type LinkState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; message: string; canRetry: boolean }
  | { status: 'ready'; expoId: string };

// 주소의 # 뒤 비밀값. 서버·접속 기록에 남지 않게 경로나 쿼리가 아니라 해시로 받는다
const readSecret = () => {
  const raw = window.location.hash.slice(1);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw).trim() || null;
  } catch {
    return null;
  }
};

const Notice = ({
  title,
  message,
  onRetry,
}: {
  title: string;
  message?: string;
  onRetry?: () => void;
}) => (
  <div
    role="alert"
    className="flex flex-1 flex-col items-center justify-center gap-12 px-16 py-40 text-center"
  >
    <p className="text-h3b text-black">{title}</p>
    {message && (
      <p className="break-keep text-body2r text-gray-500">{message}</p>
    )}
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-sm bg-main-600 px-24 py-12 text-body2r text-white"
      >
        다시 시도
      </button>
    )}
  </div>
);

/**
 * 스태프 링크로 여는 폰 화면. 관리자 로그인 없이 링크 비밀값으로 15분 토큰을 받아 입장·퇴장·간편입장·프로그램 출석만 한다.
 * 토큰은 메모리에만 두고, 끝나 가면 같은 비밀값으로 다시 받는다. 링크가 만료·회수되면 서버가 거절한다
 */
const StaffScanPage = () => {
  const [secret, setSecret] = useState<string | null | undefined>(undefined);
  const [state, setState] = useState<LinkState>({ status: 'loading' });
  const [tab, setTab] = useState<Tab>('entry');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const update = () => setSecret(readSecret());
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  const session = useMemo(
    () => (secret ? createStaffSession(secret) : null),
    [secret],
  );
  const http = useMemo(
    () => (session ? createStaffInstance(session) : null),
    [session],
  );

  useEffect(() => {
    if (secret === undefined) return;
    if (!session) {
      setState({ status: 'missing' });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    session
      .ensure()
      .then(({ expoId }) => {
        if (cancelled) return;
        const id = normalizeExpoId(expoId);
        setState(
          id
            ? { status: 'ready', expoId: id }
            : {
                status: 'error',
                message: STAFF_LINK_INVALID_MESSAGE,
                canRetry: false,
              },
        );
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setState({
          status: 'error',
          message: error.message,
          canRetry: error.message !== STAFF_LINK_INVALID_MESSAGE,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [secret, session, attempt]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col gap-16 px-16 py-20">
      <header className="flex items-center justify-between gap-12">
        <h1 className="text-h3b text-black">스태프 스캔</h1>
        {state.status === 'ready' && (
          <p className="text-caption1r text-gray-500">
            이 탭을 닫으면 다시 링크로 열어야 합니다
          </p>
        )}
      </header>
      {state.status === 'loading' && (
        <p
          role="status"
          className="py-40 text-center text-body2r text-gray-500"
        >
          스태프 링크를 확인하는 중...
        </p>
      )}
      {state.status === 'missing' && (
        <Notice
          title="스태프 링크가 아닙니다"
          message="운영진에게 받은 링크나 QR로 다시 열어 주세요."
        />
      )}
      {state.status === 'error' && (
        <Notice
          title="스태프 링크를 쓸 수 없습니다"
          message={state.message}
          onRetry={
            state.canRetry ? () => setAttempt((prev) => prev + 1) : undefined
          }
        />
      )}
      {state.status === 'ready' && http && (
        <ScanHttpProvider http={http}>
          <div
            role="tablist"
            aria-label="스캔 종류"
            className="grid grid-cols-2 gap-8"
          >
            {(
              [
                ['entry', '입장·퇴장'],
                ['program', '프로그램 출석'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`rounded-sm border-1 border-solid px-12 py-12 text-body1b ${
                  tab === value
                    ? 'border-main-600 bg-main-600 text-white'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === 'entry' ? (
            <StaffCheckInPanel expoId={state.expoId} />
          ) : (
            <StaffProgramScanPanel expoId={state.expoId} />
          )}
        </ScanHttpProvider>
      )}
    </main>
  );
};

export default StaffScanPage;
