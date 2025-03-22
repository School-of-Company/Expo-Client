import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

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
  return (
    <Link
      href={`/expo-detail/${id}`}
      className="flex gap-6 rounded-md border-1 border-solid border-gray-200 bg-white px-6 py-5"
    >
      <div className="w-1/3">
        <Image
          src={coverImage}
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
              className="text-caption2 overflow-hidden text-gray-600"
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
              className="text-body1 overflow-hidden text-black"
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
              className="text-body4 overflow-hidden text-gray-300"
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
