'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ImageInput } from '@/entities/create-exhibition';
import TrainingModule from '@/entities/create-exhibition/ui/TrainingModule';
import WarningMessage from '@/entities/create-exhibition/ui/WarningMessage';
import { Location } from '@/shared/assets/icons';
import { Button, Input } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';
import { useAddressSearch } from '../../model/useAddressSearch';
import { useExhibitionMutation } from '../../model/useExhibitionMutation';
import { ExhibitionFormData } from '../../types/type';

const ExhibitionForm = () => {
  const { register, control, handleSubmit, setValue, watch } =
    useForm<ExhibitionFormData>();
  const mutation = useExhibitionMutation();

  const onSubmit = (data: ExhibitionFormData) => {
    mutation.mutate(data);
  };

  const { openAddressSearch } = useAddressSearch(setValue);

  const showError = (message: string) => {
    toast.error(message);
  };

  const trainingFields = useFieldArray<ExhibitionFormData>({
    control,
    name: 'trainings',
  });

  const standardFields = useFieldArray<ExhibitionFormData>({
    control,
    name: 'standard',
  });

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
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">모집기간</p>
          <div className="space-y-2">
            <div className="flex items-center gap-7">
              <Input
                {...register('startedDay', {
                  required: '시작일을 입력해주세요',
                  pattern: {
                    value: /^\d{4}-\d{2}-\d{2}$/,
                    message: 'yyyy-mm-dd 형식으로 입력해주세요',
                  },
                })}
                type="text"
                placeholder="시작일"
              />
              <Input
                {...register('finishedDay', {
                  required: '마감일을 입력해주세요',
                  pattern: {
                    value: /^\d{4}-\d{2}-\d{2}$/,
                    message: 'yyyy-mm-dd 형식으로 입력해주세요',
                  },
                })}
                type="text"
                placeholder="마감일"
              />
            </div>
            <WarningMessage text="시작일과 마감일 입력시 ' yyyy-mm-dd  ' 형식으로 입력해주세요" />
          </div>
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
          <p className="text-h4 text-black">연수자 연수 종류</p>
          <TrainingModule
            fields={trainingFields.fields}
            append={trainingFields.append}
            remove={trainingFields.remove}
            register={register}
            setValue={setValue}
            watch={watch}
            fieldName="trainings"
          />
        </div>
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">참가자 연수 종류</p>
          <TrainingModule
            fields={standardFields.fields}
            append={standardFields.append}
            remove={standardFields.remove}
            register={register}
            setValue={setValue}
            watch={watch}
            fieldName="standard"
          />
        </div>
        <div className="space-y-[10px]">
          <p className="text-h4 text-black">장소</p>
          <Input
            {...register('address', {
              required: '장소를 입력해주세요.',
            })}
            type="text"
            placeholder="장소를 입력해주세요."
            icon={<Location fill="#909090" />}
            onClick={openAddressSearch}
            readOnly
          />
          <Input
            {...register('location', {
              required: '상세주소를 입력해주세요',
            })}
            type="text"
            placeholder="상세주소를 입력해주세요."
          />
        </div>
        <Button
          disabled={mutation.isPending || mutation.isSuccess}
          type="submit"
          text={
            mutation.isPending || mutation.isSuccess ? '제출 중...' : '확인'
          }
        />
      </div>
    </form>
  );
};

export default ExhibitionForm;
