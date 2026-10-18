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
  /** 조회 중이면 undefined, 실패하면 null */
  programFormCount?: number | null;
}

// 등록 폼·설문은 행사마다 필요한 것만 만든다. 미생성을 준비 미완료로 보이지 않게 있는 것만 센다
const REGISTRATION_FORM_ITEMS = [
  ['preStandardFormCreatedStatus', '사전'],
  ['siteStandardFormCreatedStatus', '현장'],
  ['traineeFormCreatedStatus', '연수'],
] as const;

const SURVEY_ITEMS = [
  ['standardSurveyCreatedStatus', '일반'],
  ['traineeSurveyCreatedStatus', '연수'],
] as const;

const createdNames = (
  items: typeof REGISTRATION_FORM_ITEMS | typeof SURVEY_ITEMS,
  status: ExpoValid,
) => items.filter(([key]) => status[key]).map(([, name]) => name);

/** 등록 폼 유형·프로그램 폼 수·설문 수를 한 줄로 보인다 */
const FormStatus = ({
  status,
  programFormCount,
}: {
  status?: ExpoValid;
  programFormCount?: number | null;
}) => {
  const registration = status
    ? createdNames(REGISTRATION_FORM_ITEMS, status)
    : null;
  const surveys = status ? createdNames(SURVEY_ITEMS, status) : null;
  const items = [
    registration &&
      (registration.length
        ? `등록 폼 ${registration.join('·')}`
        : '등록 폼 없음'),
    programFormCount === null
      ? '프로그램 폼 확인 실패'
      : programFormCount !== undefined && `프로그램 폼 ${programFormCount}개`,
    surveys && `설문 ${surveys.length}개`,
  ].filter((item): item is string => Boolean(item));

  if (!items.length) return null;
  const summary = [
    registration && `등록 폼: ${registration.join(', ') || '없음'}`,
    surveys && `설문: ${surveys.join(', ') || '없음'}`,
  ]
    .filter(Boolean)
    .join(' / ');

  return (
    // 카드 높이가 고정이라 줄바꿈하지 않고 넘치면 말줄임한다
    <p className="truncate text-caption2r text-gray-500" title={summary}>
      {items.map((item, index) => (
        <span key={item}>
          {index > 0 && (
            <span className="mx-6 text-gray-300" aria-hidden>
              ·
            </span>
          )}
          {item}
        </span>
      ))}
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
  programFormCount,
}: Props) => {
  const hasFormStatus = Boolean(formStatus) || programFormCount !== undefined;
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
                WebkitLineClamp: hasFormStatus ? 2 : 3,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
              }}
            >
              {description}
            </p>
            {hasFormStatus && (
              <FormStatus
                status={formStatus}
                programFormCount={programFormCount}
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExpoListItem;
