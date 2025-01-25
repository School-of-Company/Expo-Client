import React from 'react';
import { XMark } from '@/shared/assets/icons';
import { ModalProps } from '@/shared/types/create-exhibition/type';
import { Button, CheckBox, Input } from '@/shared/ui';

const Modal = ({ setModal, setValue, watch, index, fieldName }: ModalProps) => {
  const startedAt = watch(`${fieldName}.${index}.startedAt`);
  const endedAt = watch(`${fieldName}.${index}.endedAt`);

  return (
    <div className="absolute right-0 top-10 z-20 h-[192px] w-[312px] space-y-[24px] rounded-lg bg-white p-[18px] shadow-lg">
      <div className="flex justify-between">
        <p className="text-h4 text-black">연수 설정</p>
        <button onClick={() => setModal(false)}>
          <XMark />
        </button>
      </div>
      <div className="space-y-[28px]">
        <div className="flex w-full justify-between">
          <div className="flex w-[176px] gap-5">
            <Input
              value={startedAt || ''}
              onChange={(e) =>
                setValue(`${fieldName}.${index}.startedAt`, e.target.value)
              }
              placeholder="연수 시작 일과 시간"
              size="small"
            />
            <Input
              value={endedAt || ''}
              onChange={(e) =>
                setValue(`${fieldName}.${index}.endedAt`, e.target.value)
              }
              placeholder="연수 종료 일과 시간"
              size="small"
            />
          </div>
          {fieldName === 'trainings' && (
            <CheckBox
              text="필수"
              name={`trainings.${index}.category`}
              setValue={setValue}
              watch={watch}
            />
          )}
        </div>
        <Button onClick={() => setModal(false)} type="button" text="확인" />
      </div>
    </div>
  );
};

export default Modal;
