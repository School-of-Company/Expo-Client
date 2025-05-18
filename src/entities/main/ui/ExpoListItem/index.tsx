import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import TestImg from '@/shared/assets/png/TestExpo.png';

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
  const formatDate = (date: string) => {
    const [, month, day] = date.split('-');
    return `${month}.${day}`;
  };

  return (
    <Link
      href={`/exhibition/detail/${id}`}
      className="flex h-[150px] gap-22 rounded-sm border-1 border-solid border-gray-200 bg-white p-18"
    >
      <div
        className="overflow-hidden rounded-sm"
        style={{ width: 110, height: 110 }}
      >
        <Image
          src={coverImage || TestImg}
          alt="이미지 설명"
          width={110}
          height={110}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            width: '110px',
            height: '110px',
          }}
        />
      </div>

      <div className="w-2/3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p
              className="overflow-hidden text-caption1r text-main-400"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
              }}
            >
              행사기간 {formatDate(startedDay)} ~ {formatDate(finishedDay)}
            </p>
            <p
              className="overflow-hidden text-body1b text-black"
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
              className="overflow-hidden text-body2r text-gray-300"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
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
