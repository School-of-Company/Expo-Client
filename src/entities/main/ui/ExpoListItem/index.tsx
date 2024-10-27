import Image from 'next/image';
import React from 'react';
import TestImg from '@/shared/assets/png/TestImg.png';

interface Props {
  clubName: string;
  description: string;
  startDate: string;
  endDate: string;
}

const ExpoListItem = ({ clubName, description, startDate, endDate }: Props) => {
  return (
    <div className="flex gap-6 rounded-md border-1 border-solid border-gray-200 bg-white px-6 py-5">
      <div className="relative overflow-hidden">
        <Image
          src={TestImg}
          alt="TestClubImg"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
      <div className="flex-1">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-caption2 text-gray-600">
              모집기간: {startDate} ~ {endDate}
            </p>
            <p
              className="truncate text-body1 text-black"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {clubName}
            </p>
            <p
              className="overflow-hidden text-body4 text-gray-300"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpoListItem;
