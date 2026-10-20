'use client';

import { ReactNode, useEffect, useId, useState } from 'react';
import { Loading } from '@/shared/ui';

export interface SectionNavItem {
  id: string;
  number: string;
  label: string;
}

/** 위쪽에 붙어 다니는 빠른 이동 탭. 눌러서 그 덩어리로 가고, 지금 보는 덩어리를 표시한다 */
export const QuickNav = ({ items }: { items: SectionNavItem[] }) => {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const targets = items
      .map(({ id }) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (targets.length === 0 || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      // 화면 위쪽 1/3에 닿은 덩어리를 현재 덩어리로 본다
      { rootMargin: '-10% 0px -65% 0px' },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [items]);

  const jump = (id: string) => {
    setActive(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="신청 영역 빠른 이동"
      className="sticky top-0 z-10 grid grid-cols-3 gap-8 rounded-sm border-1 border-solid border-gray-200 bg-white p-8"
    >
      {items.map(({ id, number, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => jump(id)}
          aria-current={active === id ? 'location' : undefined}
          className={`rounded-sm px-4 py-12 text-body2b mobile:py-10 mobile:text-caption1b ${
            active === id
              ? 'bg-main-100 text-main-600'
              : 'bg-white text-gray-500'
          }`}
        >
          {number} {label}
        </button>
      ))}
    </nav>
  );
};

/** 접었다 펼 수 있는 한 덩어리. 목록 불러오기 실패·로딩·빈 상태를 같은 모양으로 보여 준다 */
export const SectionFrame = ({
  id,
  number,
  title,
  description,
  error,
  onRetry,
  isLoading,
  isEmpty,
  children,
}: {
  id: string;
  number: string;
  title: string;
  description: string;
  error: Error | null;
  onRetry: () => void;
  isLoading: boolean;
  isEmpty: boolean;
  children: ReactNode;
}) => {
  const [expanded, setExpanded] = useState(true);
  const headingId = useId();
  const bodyId = useId();
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-80 rounded-md border-1 border-solid border-gray-200 bg-white p-24 shadow-sm mobile:p-16"
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-12 text-left"
      >
        <span className="grid h-[35px] min-w-[35px] place-items-center rounded-sm bg-main-100 text-body2b text-main-600">
          {number}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-4">
          <h2 id={headingId} className="text-h3b text-black mobile:text-body1b">
            {title}
          </h2>
          <span className="whitespace-pre-line break-keep text-body2r text-gray-500">
            {description}
          </span>
        </span>
        <span
          aria-hidden
          className={`text-h3b text-gray-400 transition-transform ${expanded ? '' : '-rotate-90'}`}
        >
          ⌄
        </span>
      </button>
      <div id={bodyId} hidden={!expanded} className="mt-20">
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
          <p className="rounded-sm bg-gray-100 px-16 py-12 text-body2r text-gray-500">
            등록된 회차가 없습니다.
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
};
