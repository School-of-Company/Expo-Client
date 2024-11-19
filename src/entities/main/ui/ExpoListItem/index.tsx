import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import TestImg from '@/shared/assets/png/TestImg.png';

interface Props {
  id: number;
  coverImage: string;
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
}

const ExpoListItem = ({
  id,
  coverImage,
  title,
  description,
  startedDay,
  finishedDay,
}: Props) => {
  console.log(coverImage);
  return (
    <Link
      href={`/expo-detail/${id}`}
      className="flex gap-6 rounded-md border-1 border-solid border-gray-200 bg-white px-6 py-5"
    >
      <div className="w-1/3">
        <Image
          src={TestImg}
          alt="이미지 설명"
          width={752}
          height={360}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>
      <div className="w-2/3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p
              className="overflow-hidden text-caption2 text-gray-600"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
              }}
            >
              모집기간: {startedDay} ~ {finishedDay}
            </p>
            <p
              className="overflow-hidden text-body1 text-black"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </p>
            <p
              className="overflow-hidden text-body4 text-gray-300"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExpoListItem;
