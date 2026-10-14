'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import DefaultExpo from '@/shared/assets/png/DefaultExpo.png';
import { isValidSrc } from '@/shared/model';
import { ExpoValid } from '@/shared/types/admin/type';

interface Props {
  id: string;
  coverImage: string | null;
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  /** 없으면(조회 전·실패) 표시하지 않는다 */
  formStatus?: ExpoValid;
}

const FORM_ITEMS = [
  ['preStandardFormCreatedStatus', '사전 폼'],
  ['siteStandardFormCreatedStatus', '현장 폼'],
  ['traineeFormCreatedStatus', '연수 폼'],
] as const;

const SURVEY_ITEMS = [
  ['standardSurveyCreatedStatus', '일반 설문'],
  ['traineeSurveyCreatedStatus', '연수 설문'],
] as const;

type StatusItems = typeof FORM_ITEMS | typeof SURVEY_ITEMS;

const CreatedCount = ({
  label,
  items,
  status,
}: {
  label: string;
  items: StatusItems;
  status: ExpoValid;
}) => {
  const created = items.filter(([key]) => status[key]).length;
  return (
    <span
      className={created === items.length ? 'text-main-600' : 'text-gray-400'}
    >
      {label} {created}/{items.length}
    </span>
  );
};

/** 폼·설문 생성 개수를 한 줄로 보이고, 빠진 항목은 툴팁으로 알린다 */
const FormStatus = ({ status }: { status: ExpoValid }) => {
  const missing = [...FORM_ITEMS, ...SURVEY_ITEMS]
    .filter(([key]) => !status[key])
    .map(([, name]) => name);
  const summary = missing.length
    ? `미생성: ${missing.join(', ')}`
    : '폼·설문을 모두 만들었습니다';

  return (
    <p className="flex gap-6 text-caption2r" title={summary}>
      <CreatedCount label="폼" items={FORM_ITEMS} status={status} />
      <span className="text-gray-300" aria-hidden>
        ·
      </span>
      <CreatedCount label="설문" items={SURVEY_ITEMS} status={status} />
      <span className="sr-only">{summary}</span>
    </p>
  );
};

const ExpoListItem = ({
  id,
  coverImage,
  title,
  description,
  startedDay,
  finishedDay,
  formStatus,
}: Props) => {
  const formatDate = (date: string) => {
    const [, month, day] = date.split('-');
    return `${month}.${day}`;
  };

  // 주소 형식이 맞아도 불러오지 못하면(권한·삭제 등) 기본 이미지로 바꾼다
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const safeSrc =
    coverImage && isValidSrc(coverImage) && coverImage !== failedSrc
      ? coverImage
      : DefaultExpo;

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
          src={safeSrc}
          onError={() => setFailedSrc(coverImage)}
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
                // 생성 여부 줄이 들어가면 카드 높이에 맞춰 한 줄 줄인다
                WebkitLineClamp: formStatus ? 2 : 3,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
              }}
            >
              {description}
            </p>
            {formStatus && <FormStatus status={formStatus} />}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExpoListItem;
