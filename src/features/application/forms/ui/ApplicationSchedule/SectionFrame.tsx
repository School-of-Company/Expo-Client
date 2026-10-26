'use client';

import { ReactNode, useId } from 'react';
import { Loading } from '@/shared/ui';

export interface SectionNavItem {
  id: string;
  label: string;
  /** 탭 위에 작게 붙는 단계 표시(예: 1단계). 순서가 있는 신청에서 어느 단계인지 알려 준다 */
  step?: string;
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
    className="flex gap-8 rounded-md bg-gray-100 p-6"
  >
    {items.map(({ id, label, step }) => (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={active === id}
        aria-controls={id}
        onClick={() => onChange(id)}
        className={`flex flex-1 flex-col items-center gap-2 rounded-sm px-8 py-10 text-body2b transition-colors mobile:text-caption1b ${
          active === id
            ? 'bg-main-600 text-white shadow-sm'
            : 'bg-white text-gray-600'
        }`}
      >
        {step && (
          <span
            className={`text-caption2r ${active === id ? 'text-main-200' : 'text-gray-400'}`}
          >
            {step}
          </span>
        )}
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

/** 신청 순서 안내. 처음 보는 사람이 사전등록을 먼저 해야 한다는 것을 알 수 있게 목록 맨 위에 둔다 */
export const ApplicationSteps = () => (
  <ol className="flex flex-col gap-8 rounded-sm bg-main-100 p-16 text-body2r text-gray-700">
    <li className="break-keep">
      <span className="text-body2b text-main-600">1단계 사전등록</span> · 행사
      입장 QR을 받습니다.
    </li>
    <li className="break-keep">
      <span className="text-body2b text-main-600">2단계 프로그램·교원연수</span>{' '}
      · 사전등록이 확정된 뒤에 신청할 수 있습니다.
    </li>
  </ol>
);

/** 프로그램·교원연수 탭 위의 선행 조건 안내. 사전등록 탭이 있으면 바로 갈 수 있는 버튼을 준다 */
export const PreRegisterRequired = ({
  onGoRegistration,
}: {
  onGoRegistration?: () => void;
}) => (
  <div
    role="note"
    className="mb-16 flex flex-col gap-8 rounded-sm border-1 border-solid border-main-600 bg-main-100 p-16"
  >
    <p className="break-keep text-body2b text-main-600">
      사전등록을 먼저 해야 신청할 수 있어요
    </p>
    <p className="break-keep text-caption1r text-gray-600">
      사전등록이 확정된 참가자만 신청할 수 있습니다. 아직 사전등록 전이라면
      사전등록부터 해주세요.
    </p>
    {onGoRegistration && (
      <button
        type="button"
        onClick={onGoRegistration}
        className="self-start rounded-sm bg-main-600 px-16 py-8 text-caption1b text-white"
      >
        사전등록하러 가기
      </button>
    )}
  </div>
);
