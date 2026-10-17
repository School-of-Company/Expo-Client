import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { handleDateChange } from '@/features/exhibition/common/lib/handleDateChange';
import { XMark } from '@/shared/assets/icons';
import {
  isDateTimeRangeInvalid,
  isProgramTitleTooLong,
  PROGRAM_TITLE_MAX_LENGTH,
} from '@/shared/config/validation';
import { useModalDialog } from '@/shared/model';
import { ModalProps } from '@/shared/types/exhibition/type';
import { Button, Input } from '@/shared/ui';
import SelectDateInput from '@/shared/ui/SelectDateInput';
import SelectTimeInput from '@/shared/ui/SelectTimeInput';

// 'yyyy-MM-dd HH:mm' 문자열 <-> Date. 비어 있거나 형식이 아니면 null
const toDate = (value: string) => {
  const date = value ? new Date(value.replace(' ', 'T')) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const combine = (date: Date | null, time: Date | null) => {
  if (!date || !time) return '';
  const merged = new Date(date);
  merged.setHours(time.getHours(), time.getMinutes());
  let formatted = '';
  handleDateChange((_, value) => (formatted = value), '', merged);
  return formatted;
};

const Modal = ({ fieldName, initial, onSubmit, onClose }: ModalProps) => {
  const dialogRef = useModalDialog({ onClose });
  const isTraining = fieldName === 'trainings';
  const label = isTraining ? '연수' : '참가자 프로그램';

  const [title, setTitle] = useState(initial?.title ?? '');
  // 날짜와 시간은 따로 고르므로 따로 보관하고 저장할 때 합친다
  const initialStarted = toDate(initial?.startedAt ?? '');
  const initialEnded = toDate(initial?.endedAt ?? '');
  const [startedDate, setStartedDate] = useState(initialStarted);
  const [startedTime, setStartedTime] = useState(initialStarted);
  const [endedDate, setEndedDate] = useState(initialEnded);
  const [endedTime, setEndedTime] = useState(initialEnded);
  const [place, setPlace] = useState(initial?.place ?? '');
  const [isEssential, setIsEssential] = useState(
    initial?.category === 'ESSENTIAL',
  );

  const handleSubmit = () => {
    const startedAt = combine(startedDate, startedTime);
    const endedAt = combine(endedDate, endedTime);
    const error = !title.trim()
      ? `${label} 이름을 입력해주세요.`
      : isProgramTitleTooLong(title)
        ? `프로그램명은 ${PROGRAM_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`
        : !startedAt || !endedAt
          ? '시작·마감 날짜와 시간을 모두 선택해주세요.'
          : isDateTimeRangeInvalid(startedAt, endedAt)
            ? '프로그램 종료 일시는 시작 일시보다 늦어야 합니다.'
            : null;
    if (error) {
      toast.error(error);
      return;
    }
    onSubmit({
      title: title.trim(),
      startedAt,
      endedAt,
      // 비우면 기존 장소는 지우고, 원래 없던 장소는 보내지 않는다
      place: place.trim() || (initial?.place ? '' : undefined),
      ...(isTraining ? { category: isEssential ? 'ESSENTIAL' : 'CHOICE' } : {}),
    });
  };

  return (
    <div
      className="fixed inset-0 z-10 overflow-y-auto px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      {/* 내용이 짧으면 가운데, 길면 위에서부터 보이고 바깥이 스크롤된다 */}
      <div className="flex min-h-full items-center justify-center py-[24px]">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${label} ${initial ? '수정' : '추가'}`}
          tabIndex={-1}
          className="w-full max-w-[600px] space-y-[24px] rounded-lg bg-white p-[24px] outline-none"
        >
          <div className="flex items-center justify-between">
            <p className="text-h3b text-black">
              {label} {initial ? '수정' : '추가'}
            </p>
            <button type="button" aria-label="닫기" onClick={onClose}>
              <XMark />
            </button>
          </div>

          <div className="space-y-16">
            <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
              <div className="space-y-8">
                <p className="text-left text-sm text-gray-600">이름</p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${label} 이름을 입력해주세요`}
                  autoFocus
                />
              </div>
              <div className="space-y-8">
                <p className="text-left text-sm text-gray-600">장소 (선택)</p>
                <Input
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="비우면 '장소 추후 안내'로 표시됩니다."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
              {(
                [
                  [
                    '시작 시간',
                    startedDate,
                    setStartedDate,
                    startedTime,
                    setStartedTime,
                  ],
                  [
                    '마감 시간',
                    endedDate,
                    setEndedDate,
                    endedTime,
                    setEndedTime,
                  ],
                ] as const
              ).map(([text, date, setDate, time, setTime]) => (
                <div key={text} className="space-y-8">
                  <p className="text-left text-sm text-gray-600">{text}</p>
                  <div className="flex items-center gap-12">
                    <SelectDateInput
                      value={date}
                      onChange={setDate}
                      placeholder="날짜"
                      inputClassName="px-8 py-4"
                      emptyCenter={true}
                    />
                    <SelectTimeInput
                      value={time}
                      onChange={setTime}
                      placeholder="시간"
                    />
                  </div>
                </div>
              ))}
            </div>
            {isTraining && (
              <label className="flex items-center gap-12 text-caption1r text-gray-500">
                <input
                  type="checkbox"
                  checked={isEssential}
                  onChange={(e) => setIsEssential(e.target.checked)}
                />
                이 프로그램 필수로 참여합니다
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-16">
            <Button variant="gray" type="button" onClick={onClose}>
              취소
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {initial ? '수정' : '추가'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
