'use client';

import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ImageInput } from '@/entities/create-exhibition';
import AddressSearch from '@/entities/create-exhibition/ui/SearchAddress';
import TrainingModule from '@/entities/create-exhibition/ui/TrainingModule';
import { Button, Input } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';
import { ExhibitionFormData } from '../../types/type';

const ExhibitionForm = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = useForm<ExhibitionFormData>();

  const { fields, append, remove } = useFieldArray<ExhibitionFormData>({
    control,
    name: 'trainings',
  });

  const onSubmit = (data: ExhibitionFormData) => {
    console.log(data);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        const firstError = Object.values(errors)[0];
        if (firstError && firstError.message) {
          showError(firstError.message as string);
        }
      })}
      className="w-full"
    >
      <div className="space-y-[30px]">
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">사진 등록</p>
          <ImageInput
            register={register('image', { required: '사진을 등록해주세요.' })}
            setValue={setValue}
            id="imageUpload"
          />
        </div>
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">제목</p>
          <Input
            {...register('title', { required: '제목을 입력해주세요.' })}
            type="text"
            placeholder="제목을 입력해주세요."
          />
        </div>
        <TextArea
          title="소개글"
          placeholder="소개글을 작성해주세요."
          maxLength={1000}
          registration={register('introduction', {
            required: '소개글을 입력해주세요.',
          })}
          row={1}
        />
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">연수 종류</p>
          <TrainingModule
            fields={fields}
            append={(value) => append(value)}
            remove={remove}
            register={register}
          />
        </div>
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">장소</p>
          <AddressSearch
            setValue={setValue}
            register={register('address', { required: '장소를 입력해주세요.' })}
          />
        </div>
        <Button disabled={isSubmitting} type="submit" text="확인" />
      </div>
    </form>
  );
};

export default ExhibitionForm;
