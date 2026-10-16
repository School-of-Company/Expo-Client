'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ContentListText,
  ContentText,
  copyExpoLink,
  KaKaoMap,
  ShowLocation,
} from '@/entities/exhibition';
import DefaultExpo from '@/shared/assets/png/DefaultExpo.png';
import { Share } from '@/shared/assets/svg';
import { getExpoRoutes } from '@/shared/config';
import { isValidSrc } from '@/shared/model';
import {
  ExpoDetail,
  ExpoStandard,
  ExpoTrainingDetail,
} from '@/shared/types/exhibition/detail/type';
import { PageTitle } from '@/shared/ui';

const ExpoDetailLayout = ({
  expoDetail,
  expoStandard,
  expoTraining,
  expoId,
}: {
  expoDetail: ExpoDetail;
  expoStandard: ExpoStandard[];
  expoTraining: {
    essential: ExpoTrainingDetail[];
    choice: ExpoTrainingDetail[];
  };
  expoId: string;
}) => {
  const router = useRouter();
  const date = `${expoDetail?.startedDay} ~ ${expoDetail?.finishedDay}`;

  const safeSrc =
    expoDetail.coverImage && isValidSrc(expoDetail.coverImage)
      ? expoDetail.coverImage
      : DefaultExpo;

  return (
    <div className="flex w-full flex-col space-y-48">
      <PageTitle
        title={expoDetail?.title}
        onBack={() => router.back()}
        action={
          // PC 는 오른쪽 운영 패널에 같은 버튼이 있고, 패널이 아래로 내려가는 태블릿 이하에서만 보인다
          <button
            type="button"
            aria-label="신청 폼 링크 복사"
            onClick={() =>
              copyExpoLink(
                getExpoRoutes(expoId).applicationForms,
                '신청 폼 링크',
              )
            }
            className="hidden h-[44px] w-[44px] items-center justify-center tablet:flex"
          >
            <Share />
          </button>
        }
      />

      <div className="w-full space-y-36">
        <div className="relative h-[360px] w-full">
          <Image
            src={safeSrc}
            alt="expoImage"
            fill
            className="rounded-md object-cover"
          />
        </div>

        <div className="w-full space-y-32">
          <div className="space-y-16">
            <ContentText title="초대의 글" content={expoDetail?.description} />
            <div className="text-caption1r text-gray-700">
              박람회 기간 &nbsp; {date}
            </div>
          </div>

          {(expoStandard?.length > 0 ||
            expoTraining?.essential.length > 0 ||
            expoTraining?.choice.length > 0) && (
            <div className="space-y-14">
              <p className="text-body1b text-gray-600">프로그램</p>
              {expoStandard?.length > 0 && (
                <ContentListText data={expoStandard} title="참여자 연수" />
              )}
              {expoTraining?.essential.length > 0 && (
                <ContentListText
                  data={expoTraining?.essential}
                  title="연수자 필수 연수"
                />
              )}
              {expoTraining?.choice.length > 0 && (
                <ContentListText
                  data={expoTraining.choice}
                  title="연수자 선택 연수"
                />
              )}
            </div>
          )}

          <div className="space-y-14">
            <ShowLocation
              latitude={Number(expoDetail?.y)}
              longitude={Number(expoDetail?.x)}
              detailAddress={expoDetail.location}
            />
            <KaKaoMap
              latitude={Number(expoDetail?.y)}
              longitude={Number(expoDetail?.x)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpoDetailLayout;
