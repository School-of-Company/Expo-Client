import React, { useEffect, useState } from 'react';
import { XMark } from '@/shared/assets/icons';
import { ModalProps } from '@/shared/types/exhibition/type';
import {
  Button,
  CheckBox,
  SelectDateInput,
  SelectTimeInput,
} from '@/shared/ui';
import { handleDateChange } from '../../model/handleDateChange';

const Modal = ({ setModal, setValue, watch, index, fieldName }: ModalProps) => {
  const initialStarted = watch(`${fieldName}.${index}.startedAt`);
  const initialEnded = watch(`${fieldName}.${index}.endedAt`);

  const [startedDate, setStartedDate] = useState<Date | null>(null);
  const [startedTime, setStartedTime] = useState<Date | null>(null);
  const [endedDate, setEndedDate] = useState<Date | null>(null);
  const [endedTime, setEndedTime] = useState<Date | null>(null);

  // 초기값 설정
  useEffect(() => {
    if (initialStarted) {
      const date = new Date(initialStarted);
      setStartedDate(date);
      setStartedTime(date);
    }
    if (initialEnded) {
      const date = new Date(initialEnded);
      setEndedDate(date);
      setEndedTime(date);
    }
  }, []);

  // 날짜 + 시간이 모두 선택되었을 때만 setValue 호출
  useEffect(() => {
    if (startedDate && startedTime) {
      const combined = new Date(startedDate);
      combined.setHours(startedTime.getHours());
      combined.setMinutes(startedTime.getMinutes());
      handleDateChange(setValue, `${fieldName}.${index}.startedAt`, combined);
    }
  }, [startedDate, startedTime]);

  useEffect(() => {
    if (endedDate && endedTime) {
      const combined = new Date(endedDate);
      combined.setHours(endedTime.getHours());
      combined.setMinutes(endedTime.getMinutes());
      handleDateChange(setValue, `${fieldName}.${index}.endedAt`, combined);
    }
  }, [endedDate, endedTime]);

  return (
    <div className="absolute right-0 top-10 z-20 max-w-[304px] rounded-lg bg-white p-[18px] shadow-lg">
      <div className="flex h-auto w-full max-w-[90vw] flex-col space-y-[24px]">
        <div className="flex items-center justify-between">
          <p className="text-h3b text-black">프로그램 설정</p>
          <button type="button" onClick={() => setModal(false)}>
            <XMark />
          </button>
        </div>

        <div className="space-y-16">
          <div className="space-y-12">
            <div className="flex w-full flex-col space-y-10">
              <p className="text-left text-sm text-gray-600">시작 시간</p>
              <div className="flex items-center gap-12">
                <SelectDateInput
                  value={startedDate}
                  onChange={(date) => setStartedDate(date)}
                  placeholder="날짜"
                  inputClassName="px-8 py-4"
                  emptyCenter={true}
                />
                <SelectTimeInput
                  value={startedTime}
                  onChange={(time) => setStartedTime(time)}
                  placeholder="시간"
                />
              </div>
            </div>

            <div className="flex w-full flex-col space-y-10">
              <p className="text-left text-sm text-gray-600">마감 시간</p>
              <div className="flex items-center gap-12">
                <SelectDateInput
                  value={endedDate}
                  onChange={(date) => setEndedDate(date)}
                  placeholder="날짜"
                  inputClassName="px-8 py-4"
                  emptyCenter={true}
                />
                <SelectTimeInput
                  value={endedTime}
                  onChange={(time) => setEndedTime(time)}
                  placeholder="시간"
                />
              </div>
            </div>

            {fieldName === 'trainings' && (
              <CheckBox
                text="이 프로그램 필수로 참여합니다"
                name={`trainings.${index}.category`}
                setValue={setValue}
                watch={watch}
              />
            )}
          </div>
        </div>

        <Button onClick={() => setModal(false)} type="button">
          확인
        </Button>
      </div>
    </div>
  );
};

export default Modal;
