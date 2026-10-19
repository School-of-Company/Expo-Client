'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { getSuccessMessage } from '@/features/application';
import { ApplicationSuccessLogo } from '@/shared/assets/svg';
import { getExpoRoutes } from '@/shared/config';

const SuccessCheck = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType');
  const formType = searchParams.get('formType');
  const status = searchParams.get('status');
  const position = searchParams.get('position');

  const isWaiting = status === 'WAITING' || status === 'PROCESSING';
  const routes = getExpoRoutes(id);

  return (
    <div className="flex flex-col items-center gap-32">
      <ApplicationSuccessLogo className="mobile:h-[160px] mobile:w-[160px]" />
      <p className="text-center text-h1m text-main-600 mobile:text-body1b">
        {isWaiting
          ? '대기로 접수되었습니다.'
          : getSuccessMessage(userType, formType)}
      </p>
      {isWaiting && (
        <p className="text-center text-body1r text-gray-600">
          {status === 'WAITING' && position && `대기 순번 ${position}번 · `}
          자리가 나야 확정되며, 확정되면 QR이 대표자 번호로 발송됩니다.
          <br />
          대기 중에는 QR과 연수 신청이 없으며, 신청 폼 모음의 나의 신청 현황에서
          대기 순번을 확인하거나 일행 전체 대기를 취소할 수 있습니다.
        </p>
      )}
      <div className="flex w-full flex-col gap-12">
        <Link
          href={routes.applicationMy}
          className="flex h-[50px] w-full items-center justify-center rounded-sm bg-main-600 text-body1b text-white"
        >
          {isWaiting ? '대기 현황 보기' : '내 신청·QR 보기'}
        </Link>
        {!isWaiting && (
          <Link
            href={
              userType === 'TRAINEE'
                ? routes.applicationTraining
                : routes.applicationProgram
            }
            className="flex h-[50px] w-full items-center justify-center rounded-sm border border-main-600 text-body1b text-main-600"
          >
            {userType === 'STANDARD' && formType === 'application'
              ? '이 시간대 프로그램 신청하기'
              : '다른 프로그램 신청하기'}
          </Link>
        )}
      </div>
    </div>
  );
};

export default SuccessCheck;
