'use client';

import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ContentListText from '@/entities/expo-detail/ui/ContentListText';
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

interface ExpoTrainingDetail {
  title: string;
  startedAt: string;
  endedAt: string;
  category: 'ESSENTIAL' | 'CHOICE';
}

interface ExpoTraining {
  essential: ExpoTrainingDetail[];
  choice: ExpoTrainingDetail[];
}

interface ExpoStandard {
  title: string;
  startedAt: string;
  endedAt: string;
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

  const [expoStandard, setExpoStandard] = useState<ExpoStandard[]>([]);
  const [expoTraining, setExpoTraining] = useState<ExpoTraining>({
    essential: [],
    choice: [],
  });

  useEffect(() => {
    axios.get<ExpoDetail>(`/api/expo/${params}`).then((res) => {
      setExpoDetail(res.data);
    });

    axios.get<ExpoStandard[]>(`/api/standard/program/${params}`).then((res) => {
      setExpoStandard(res.data);
    });

    axios
      .get<ExpoTrainingDetail[]>(`/api/training/program/${params}`)
      .then((res) => {
        const essential = res.data.filter(
          (item) => item.category === 'ESSENTIAL',
        );
        const choice = res.data.filter((item) => item.category === 'CHOICE');
        setExpoTraining({ essential, choice });
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
          {expoStandard.length > 0 && (
            <ContentListText data={expoStandard} title="참여자 연수" />
          )}

          {expoTraining.essential.length > 0 && (
            <ContentListText data={expoTraining.essential} title="필수 연수" />
          )}
          {expoTraining.choice.length > 0 && (
            <ContentListText data={expoTraining.choice} title="선택 연수" />
          )}

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
