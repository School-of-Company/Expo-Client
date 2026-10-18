'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DefaultExpo from '@/shared/assets/png/DefaultExpo.png';
import { getExpoRoutes } from '@/shared/config';
import { withLoading } from '@/shared/hocs';
import { isValidSrc } from '@/shared/model';
import { usePublicExpoDetail } from '../../api/getPublicExpoDetail';
import { getSuccessMessage } from '../../lib/getSuccessMessage';

// 등록을 마친 참가자가 도착하는 박람회 랜딩. 관리자가 등록한 사진·초대의 글과 다음 행동(내 신청·QR, 다른 프로그램 신청)을 보여 준다
const ExpoLandingContainer = ({ expoId }: { expoId: string }) => {
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType');
  const formType = searchParams.get('formType');
  const status = searchParams.get('status');
  const position = searchParams.get('position');

  // 공개 정보를 못 받아도 등록 결과와 다음 행동은 보여 준다. 사진은 기본 이미지로 대신한다
  const { data: expo, isLoading } = usePublicExpoDetail(expoId);

  const isWaiting = status === 'WAITING' || status === 'PROCESSING';
  const routes = getExpoRoutes(expoId);
  const coverSrc =
    expo?.coverImage && isValidSrc(expo.coverImage)
      ? expo.coverImage
      : DefaultExpo;

  return withLoading({
    isLoading,
    children: (
      <div className="mt-30 flex w-full max-w-[816px] flex-col gap-30 pb-30">
        {formType && (
          <div
            role="status"
            className="flex flex-col gap-8 rounded-sm bg-main-100 p-24 mobile:p-16"
          >
            <p className="text-body1b text-main-600 mobile:text-body2b">
              {isWaiting
                ? '대기로 접수되었습니다.'
                : getSuccessMessage(userType, formType)}
            </p>
            {isWaiting && (
              <p className="break-keep text-body2r text-gray-600 mobile:text-caption1r">
                {status === 'WAITING' &&
                  position &&
                  `대기 순번 ${position}번 · `}
                자리가 나야 확정되며, 확정되면 QR이 대표자 번호로 발송됩니다.
                대기 중에는 QR과 연수 신청이 없으며, 신청 폼 모음의 나의 신청
                현황에서 대기 순번을 확인하거나 일행 전체 대기를 취소할 수
                있습니다.
              </p>
            )}
          </div>
        )}

        <div className="relative aspect-[16/9] w-full">
          <Image
            src={coverSrc}
            alt={
              expo?.title ? `${expo.title} 대표 이미지` : '박람회 대표 이미지'
            }
            fill
            priority
            sizes="(max-width: 816px) 100vw, 816px"
            className="rounded-md object-cover"
          />
        </div>

        {expo && (
          <div className="flex flex-col gap-24">
            <div className="flex flex-col gap-8">
              <p className="break-keep text-h2b text-black mobile:text-h3b">
                {expo.title}
              </p>
              <p className="text-caption1r text-gray-600">
                {expo.startedDay} ~ {expo.finishedDay}
                {expo.location && ` · ${expo.location}`}
              </p>
            </div>
            {expo.description && (
              <div className="flex flex-col gap-14">
                <p className="text-body1b text-gray-600">초대의 글</p>
                <p className="whitespace-pre-line break-words text-body2r text-gray-500">
                  {expo.description}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex w-full flex-col gap-12">
          <Link
            href={routes.applicationForms}
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
              다른 프로그램 신청하기
            </Link>
          )}
        </div>
      </div>
    ),
  });
};

export default ExpoLandingContainer;
