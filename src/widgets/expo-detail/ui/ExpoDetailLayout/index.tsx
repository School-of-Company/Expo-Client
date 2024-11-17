'use client';

import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ContentText from '@/entities/expo-detail/ui/ContentText';
import DetailHeader from '@/entities/expo-detail/ui/DetailHeader';
import KakaoMap from '@/entities/expo-detail/ui/KaKaoMap';

interface ExpoDetail {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;

  x: number;
  y: number;
}

const ExpoDetailLayout = ({ params }: { params: number }) => {
  const [expoDetail, setExpoDetail] = useState<ExpoDetail>({
    title: '',
    description: '',
    startedDay: '',
    finishedDay: '',
    location: '',
    coverImage: '',
    x: 0,
    y: 0,
  });

  useEffect(() => {
    axios.get(`/api/expo/${params}`).then((res) => {
      setExpoDetail(res.data);
    });
  }, [params]);

  const date = `${expoDetail.startedDay} ~ ${expoDetail.finishedDay}`;
  return (
    <div>
      <DetailHeader headerTitle={expoDetail.title} />
      <div className="ml-[20px] mt-[48px] flex space-y-9">
        <div className="space-y-[36px]">
          <Image
            src={expoDetail.coverImage}
            alt="TestClubImg"
            objectFit="cover"
            className="rounded-md"
            width={752}
            height={360}
          />
          <ContentText title="소개 글" content={expoDetail.description} />
          <ContentText title="모집 기간" content={date} />
          {/* <ContentText title="연수" content={expoDetail.training.content} /> */}
          <div className="space-y-4">
            <ContentText title="장소 지도" content={expoDetail.location} />
            <KakaoMap latitude={expoDetail.x} longitude={expoDetail.y} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpoDetailLayout;
