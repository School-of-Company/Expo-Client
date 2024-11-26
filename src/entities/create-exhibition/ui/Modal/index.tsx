import React from 'react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { XMark } from '@/shared/assets/icons';
import { Button, CheckBox, Input } from '@/shared/ui';
import { ExhibitionFormData } from '@/widgets/create-exhibition/types/type';

interface ModalProps {
  setModal: (value: boolean) => void;
  register: UseFormRegister<ExhibitionFormData>;
  setValue: UseFormSetValue<ExhibitionFormData>;
  watch: UseFormWatch<ExhibitionFormData>;
  index: number;
  fieldName: 'trainings' | 'standard';
}

const Modal = ({
  setModal,
  register,
  setValue,
  watch,
  index,
  fieldName,
}: ModalProps) => {
  const startedAt = watch(`${fieldName}.${index}.startedAt`);
  const endedAt = watch(`${fieldName}.${index}.endedAt`);

  return (
    <div className="absolute right-0 top-10 h-[192px] w-[312px] space-y-[24px] rounded-lg bg-white p-[18px] shadow-lg">
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
              {...register(`${fieldName}.${index}.startedAt`, {
                required: '연수 시작 일과 시간을 입력해주세요.',
                pattern: {
                  value: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
                  message: 'yyyy-mm-dd HH:mm 형식으로 입력해주세요',
                },
              })}
              placeholder="연수 시작 일과 시간"
              size="small"
              value={startedAt || ''}
            />
            <Input
              {...register(`${fieldName}.${index}.endedAt`, {
                required: '연수 종료 일과 시간을 입력해주세요.',
                pattern: {
                  value: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
                  message: 'yyyy-mm-dd HH:mm 형식으로 입력해주세요',
                },
              })}
              placeholder="연수 종료 일과 시간"
              size="small"
              value={endedAt || ''}
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
