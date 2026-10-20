'use client';

import { ToggleButton } from '@/shared/ui';
import { formatKst, OccupationOpenAtValue } from '../../model/occupationOpenAt';

interface Props {
  value: OccupationOpenAtValue;
  onChange: (value: OccupationOpenAtValue) => void;
  /** 앞 화면에서 고른 공통 신청 기간(ISO) */
  startDate: string;
  endDate: string;
  error: string | null;
}

/** 달력 아이콘만이 아니라 칸 어디를 눌러도 날짜 선택을 연다. 지원하지 않는 브라우저는 기본 동작 그대로다. */
const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // 사용자 동작이 아니라고 판단되면 던진다. 기본 입력은 그대로 쓸 수 있다
  }
};

/** 일반 사전등록에서 교원·예비교사를 먼저 받고, 그 외 유형은 따로 정한 시각부터 받는다 */
const OccupationOpenAtField = ({
  value,
  onChange,
  startDate,
  endDate,
  error,
}: Props) => {
  const start = formatKst(startDate) || '-';
  const end = formatKst(endDate) || '-';

  return (
    <section className="w-full max-w-[816px] space-y-12 rounded-sm border-1 border-solid border-gray-200 p-20">
      <div className="flex items-center justify-between gap-12">
        <div className="space-y-4">
          <p className="text-body2b text-black">참가자 유형별 신청 시작</p>
          <p className="break-keep text-caption1r text-gray-500">
            {`사전등록 신청 기간 ${start} ~ ${end} (한국 시각). 행사 회차 일시와는 별개입니다.`}
          </p>
        </div>
        <ToggleButton
          label="교원·예비교사 먼저 받기"
          value={value.enabled}
          onChange={(enabled) => onChange({ ...value, enabled })}
        />
      </div>
      {value.enabled ? (
        <>
          <input
            type="datetime-local"
            aria-label="그 외 유형 신청 시작 시각"
            value={value.local}
            onClick={openPicker}
            onChange={(e) => onChange({ ...value, local: e.target.value })}
            className="text-body4 w-full cursor-pointer rounded-sm border-1 border-solid border-gray-200 px-16 py-12 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <p className="break-keep text-caption1r text-gray-500">
            {`교원·예비교사는 ${start}부터, 그 외 유형은 ${value.local ? value.local.replace(/-/g, '.').replace('T', ' ') : '위 시각'}부터 신청할 수 있습니다.`}
          </p>
        </>
      ) : (
        <p className="break-keep text-caption1r text-gray-500">
          {`모든 유형이 ${start}부터 신청할 수 있습니다.`}
        </p>
      )}
      {error && (
        <p role="alert" className="text-caption1r text-error">
          {error}
        </p>
      )}
    </section>
  );
};

export default OccupationOpenAtField;
