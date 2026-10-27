'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { formatDefinitionSchedule } from '@/features/registration/common/model/ledger';
import { getExpoRoutes } from '@/shared/config';
import { Loading } from '@/shared/ui';
import { useLiveSeats } from '../../model/useLiveSeats';
import {
  getPreRegisterSessionState,
  PRE_REGISTER_SESSION_STATE_LABEL,
  usePreRegisterSessions,
} from '../../model/usePreRegister';
import { LiveSeatsNote, SeatSummary } from '../LiveSeats';

const Notice = ({ title, children }: { title: string; children: string }) => (
  <div className="flex flex-col gap-8 rounded-sm border-1 border-solid border-main-300 bg-main-100 p-24">
    <p className="text-body2b text-main-600">{title}</p>
    <p className="break-keep text-body2r text-gray-600">{children}</p>
  </div>
);

/**
 * 회차 없이 들어온 사전등록에서 회차를 고른다. 신청할 수 있는 회차가 하나면 바로 그 회차로 보낸다.
 * 임의 회차를 기본값으로 넣지 않고, 정원·기간의 최종 판정은 신청할 때 서버가 한다
 */
const PreRegisterSessionSelect = ({ expoId }: { expoId: string }) => {
  const router = useRouter();
  const {
    data: sessions,
    error,
    refetch,
    isFetching,
  } = usePreRegisterSessions(expoId);
  const { data: seats, isError: seatsFailed } = useLiveSeats(expoId);
  const basePath = `/application/forms/${expoId}/pre-register`;
  const backHref = getExpoRoutes(expoId).applicationListTab('registration');

  const openSessions = (sessions ?? []).filter(
    (session) => getPreRegisterSessionState(session) === 'OPEN',
  );
  const onlySessionId =
    openSessions.length === 1 ? openSessions[0].id : undefined;

  useEffect(() => {
    if (onlySessionId !== undefined)
      router.replace(`${basePath}?sessionId=${onlySessionId}`);
  }, [onlySessionId, basePath, router]);

  const content = () => {
    if (error)
      return (
        <div className="flex flex-col gap-8 rounded-sm border-1 border-solid border-error bg-white p-24">
          <p className="text-body2b text-error">회차를 불러오지 못했습니다</p>
          <p className="break-keep text-body2r text-gray-600">
            {error.message} 잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="self-start text-body2b text-main-600 underline disabled:text-gray-300"
          >
            다시 불러오기
          </button>
        </div>
      );
    // 하나뿐인 회차로 옮기는 동안에도 목록 대신 로딩을 보여 준다
    if (!sessions || onlySessionId !== undefined)
      return (
        <div className="flex justify-center py-40">
          <Loading />
        </div>
      );
    if (sessions.length === 0)
      return (
        <Notice title="신청할 수 있는 회차가 없습니다">
          아직 사전등록 회차가 열리지 않았습니다. 운영 측 안내를 확인해 주세요.
        </Notice>
      );

    return (
      <div className="flex flex-col gap-16">
        {openSessions.length === 0 ? (
          <Notice title="모든 회차의 접수가 끝났습니다">
            지금 신청할 수 있는 사전등록 회차가 없습니다.
          </Notice>
        ) : (
          <p className="text-body2r text-gray-500">
            신청할 회차를 골라 주세요.{' '}
            {seats?.preRegister.status !== 'ok' &&
              '남은 자리는 회차를 고른 뒤 확인할 수 있습니다.'}
          </p>
        )}
        <LiveSeatsNote fetchedAt={seats?.fetchedAt} failed={seatsFailed} />
        <ul className="flex flex-col gap-12">
          {sessions.map((session) => {
            const state = getPreRegisterSessionState(session);
            const isOpen = state === 'OPEN';
            const body = (
              <>
                <div className="flex items-start justify-between gap-12">
                  <p className="min-w-0 break-keep text-body1b text-black mobile:text-body2b">
                    {session.title}
                  </p>
                  <span
                    className={`flex-none text-caption1b ${isOpen ? 'text-main-600' : 'text-gray-400'}`}
                  >
                    {PRE_REGISTER_SESSION_STATE_LABEL[state]}
                  </span>
                </div>
                <p className="text-body2r text-gray-600">
                  {formatDefinitionSchedule(session.startedAt, session.endedAt)}
                </p>
                {session.place && (
                  <p className="min-w-0 break-words break-keep text-body2r text-gray-500">
                    장소: {session.place}
                  </p>
                )}
                <SeatSummary group={seats?.preRegister} id={session.id} />
              </>
            );
            return (
              <li key={session.id}>
                {isOpen ? (
                  <Link
                    href={`${basePath}?sessionId=${session.id}`}
                    className="flex flex-col gap-8 rounded-sm border-1 border-solid border-gray-200 p-24 hover:border-main-600 mobile:p-16"
                  >
                    {body}
                  </Link>
                ) : (
                  <div
                    aria-disabled
                    className="flex flex-col gap-8 rounded-sm border-1 border-solid border-gray-100 bg-gray-50 p-24 mobile:p-16"
                  >
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="mt-30 flex w-full max-w-[816px] flex-col gap-30">
      <p className="border-b-1 border-solid border-gray-200 pb-24 text-h2b text-black mobile:text-h3b">
        사전등록 회차 선택
      </p>
      {content()}
      <Link
        href={backHref}
        className="rounded-sm bg-gray-100 px-24 py-14 text-center text-body2b text-gray-700"
      >
        신청 폼 모음으로
      </Link>
    </div>
  );
};

export default PreRegisterSessionSelect;
