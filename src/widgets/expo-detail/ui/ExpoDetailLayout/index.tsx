import Image from 'next/image';
import ContentListText from '@/entities/expo-detail/ui/ContentListText';
import ContentText from '@/entities/expo-detail/ui/ContentText';
import KakaoMap from '@/entities/expo-detail/ui/KaKaoMap';
import {
  ExpoDetail,
  ExpoStandard,
  ExpoTrainingDetail,
} from '@/shared/types/expo-detail/type';
import DetailHeader from '@/shared/ui/DetailHeader';

const ExpoDetailLayout = ({
  expoDetail,
  expoStandard,
  expoTraining,
}: {
  expoDetail: ExpoDetail;
  expoStandard: ExpoStandard[];
  expoTraining: {
    essential: ExpoTrainingDetail[];
    choice: ExpoTrainingDetail[];
  };
}) => {
  const date = `${expoDetail?.startedDay} ~ ${expoDetail?.finishedDay}`;

  return (
    <div className="ml-[20px] mt-[48px] flex flex-col space-y-9">
      <DetailHeader headerTitle={expoDetail?.title} />
      <div className="space-y-[36px]">
        <Image
          src={expoDetail?.coverImage}
          alt="TestClubImg"
          objectFit="cover"
          className="rounded-md"
          width={752}
          height={360}
        />
        <ContentText title="소개 글" content={expoDetail?.description} />
        <ContentText title="모집 기간" content={date} />
        {expoStandard?.length > 0 && (
          <ContentListText data={expoStandard} title="참여자 연수" />
        )}
        {expoTraining?.essential.length > 0 && (
          <ContentListText data={expoTraining?.essential} title="필수 연수" />
        )}
        {expoTraining?.choice.length > 0 && (
          <ContentListText data={expoTraining.choice} title="선택 연수" />
        )}
        <div className="space-y-4">
          <ContentText title="장소 지도" content={expoDetail?.location} />
          <KakaoMap latitude={expoDetail?.x} longitude={expoDetail?.y} />
        </div>
      </div>
    </div>
  );
};

export default ExpoDetailLayout;
