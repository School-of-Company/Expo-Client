import Image from 'next/image';
import React from 'react';
import ContentText from '@/entities/expo-detail/ui/ContentText';
import DetailHeader from '@/entities/expo-detail/ui/DetailHeader';
import KakaoMap from '@/entities/expo-detail/ui/KaKaoMap';
import TestExpo from '@/shared/assets/png/TestExpo.png';
import { useMockExpoDetail } from '../../model/useMockExpoDetail';

const ExpoDetailLayout = () => {
  const { expoDetail } = useMockExpoDetail();

  return (
    <div className="px-5">
      <DetailHeader headerTitle={expoDetail.headerTitle} />
      <div className="mt-[48px] flex justify-center space-y-9">
        <div className="space-y-[36px]">
          <Image
            src={TestExpo}
            alt="TestClubImg"
            objectFit="cover"
            className="rounded-md"
          />
          <ContentText
            title="소개 글"
            content={expoDetail.introduction.content}
          />
          <ContentText title="연수" content={expoDetail.training.content} />
          <div className="space-y-4">
            <ContentText
              title="장소 지도"
              content={expoDetail.location.address}
            />
            <KakaoMap
              latitude={expoDetail.location.coordinates.latitude}
              longitude={expoDetail.location.coordinates.longitude}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpoDetailLayout;
