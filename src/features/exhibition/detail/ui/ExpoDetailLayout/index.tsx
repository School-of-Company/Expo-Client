'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ContentListText,
  ContentText,
  KaKaoMap,
  ShowLocation,
} from '@/entities/exhibition';
import DefaultExpo from '@/shared/assets/png/DefaultExpo.png';
import { Share } from '@/shared/assets/svg';
import { isValidSrc } from '@/shared/model';
import {
  ExpoDetail,
  ExpoStandard,
  ExpoTrainingDetail,
} from '@/shared/types/exhibition/detail/type';
import DetailHeader from '@/shared/ui/DetailHeader';

const ExpoDetailLayout = ({
  expoDetail,
  expoStandard,
  expoTraining,
  onShare,
}: {
  expoDetail: ExpoDetail;
  expoStandard: ExpoStandard[];
  expoTraining: {
    essential: ExpoTrainingDetail[];
    choice: ExpoTrainingDetail[];
  };
  onShare: () => void;
}) => {
  const router = useRouter();
  const date = `${expoDetail?.startedDay} ~ ${expoDetail?.finishedDay}`;

  const safeSrc =
    expoDetail.coverImage && isValidSrc(expoDetail.coverImage)
      ? expoDetail.coverImage
      : DefaultExpo;

  return (
    <div className="flex w-full flex-col space-y-48">
      <div className="relative">
        {/* 패널에서 상세로 돌아온 뒤에도 뒤로 가면 이전 패널이 아니라 관리자 메인으로 간다 */}
        <DetailHeader
          textCenter={true}
          headerTitle={expoDetail?.title}
          onBack={() => router.push('/admin')}
        />
        <button
          type="button"
          onClick={onShare}
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 tablet:block"
        >
          <Share />
        </button>
      </div>

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
                <ContentListText data={expoStandard} title="참가자 프로그램" />
              )}
              {expoTraining?.essential.length > 0 && (
                <ContentListText
                  data={expoTraining?.essential}
                  title="교원 필수 연수"
                />
              )}
              {expoTraining?.choice.length > 0 && (
                <ContentListText data={expoTraining.choice} title="교원 연수" />
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
