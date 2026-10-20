'use client';

import { ReactNode, useId } from 'react';
import { Loading } from '@/shared/ui';

export interface SectionNavItem {
  id: string;
  label: string;
}

/** 사전등록 / 프로그램 신청 / 교원연수 신청을 버튼으로 나눠 한 번에 하나만 보여 주는 탭 */
export const SectionTabs = ({
  items,
  active,
  onChange,
}: {
  items: SectionNavItem[];
  active: string;
  onChange: (id: string) => void;
}) => (
  <div
    role="tablist"
    aria-label="신청 종류"
    className="flex gap-4 rounded-md bg-gray-100 p-4"
  >
    {items.map(({ id, label }) => (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={active === id}
        aria-controls={id}
        onClick={() => onChange(id)}
        className={`flex-1 rounded-sm px-8 py-10 text-body2b transition-colors mobile:text-caption1b ${
          active === id ? 'bg-white text-main-600 shadow-sm' : 'text-gray-500'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

/** 탭 하나의 내용. 목록 불러오기 실패·로딩·빈 상태를 같은 모양으로 보여 준다 */
export const SectionFrame = ({
  id,
  title,
  description,
  error,
  onRetry,
  isLoading,
  isEmpty,
  children,
}: {
  id: string;
  title: string;
  description: string;
  error: Error | null;
  onRetry: () => void;
  isLoading: boolean;
  isEmpty: boolean;
  children: ReactNode;
}) => {
  const headingId = useId();
  return (
    <section id={id} role="tabpanel" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-h3b text-black mobile:text-body1b">
        {title}
      </h2>
      <p className="mt-4 whitespace-pre-line break-keep text-caption1r text-gray-500">
        {description}
      </p>
      <div className="mt-16">
        {error ? (
          <div
            role="alert"
            className="flex flex-col gap-8 rounded-sm border-1 border-solid border-error bg-white p-24 mobile:p-16"
          >
            <p className="break-keep text-body2r text-gray-600">
              {error.message || '일정을 불러오지 못했습니다.'} 잠시 후 다시
              시도해 주세요.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="self-start text-body2b text-main-600 underline"
            >
              다시 불러오기
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-24">
            <Loading />
          </div>
        ) : isEmpty ? (
          <p className="rounded-sm bg-gray-100 px-16 py-16 text-center text-body2r text-gray-500">
            등록된 회차가 없습니다.
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
};
