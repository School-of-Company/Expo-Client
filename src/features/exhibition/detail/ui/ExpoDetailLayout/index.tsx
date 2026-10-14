'use client';

import Image from 'next/image';
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
  openModal,
}: {
  expoDetail: ExpoDetail;
  expoStandard: ExpoStandard[];
  expoTraining: {
    essential: ExpoTrainingDetail[];
    choice: ExpoTrainingDetail[];
  };
  openModal: (type: string, content: string) => void;
}) => {
  const date = `${expoDetail?.startedDay} ~ ${expoDetail?.finishedDay}`;

  const safeSrc =
    expoDetail.coverImage && isValidSrc(expoDetail.coverImage)
      ? expoDetail.coverImage
      : DefaultExpo;

  return (
    <div className="flex w-full flex-col space-y-48">
      <div className="relative">
        <DetailHeader textCenter={true} headerTitle={expoDetail?.title} />
        <button
          type="button"
          onClick={() => openModal('share', '공유할 항목을 선택하세요.')}
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 tablet:block"
        >
          <Share />
        </button>
      </div>

      <div className="w-full space-y-36">
        {/* 포스터·배너 비율이 제각각이라 높이를 고정해 자르지 않고 원본 비율로 전부 보여 준다.
            세로로 아주 긴 이미지는 최대 높이 안에서 가운데 맞춘다 */}
        <div className="flex w-full justify-center overflow-hidden rounded-md bg-gray-100">
          <Image
            src={safeSrc}
            alt="expoImage"
            width={0}
            height={0}
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
            className="h-auto max-h-[640px] w-auto max-w-full object-contain mobile:max-h-[480px]"
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
