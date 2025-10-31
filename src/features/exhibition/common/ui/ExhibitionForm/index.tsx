'use client';

import { format } from 'date-fns';
import { useFieldArray, useForm } from 'react-hook-form';
import { ImageInput } from '@/entities/exhibition';
import TrainingModule from '@/entities/exhibition/ui/TrainingModule';
import { useAddressSearch } from '@/features/exhibition/common/hooks/useAddressSearch';
import { Location } from '@/shared/assets/icons';
import { handleFormErrors } from '@/shared/model';
import { showError } from '@/shared/model';
import {
  ExhibitionFormData,
  MutationType,
} from '@/shared/types/exhibition/type';
import { Button, DetailHeaderEditable, Input } from '@/shared/ui';
import SelectDateInput from '@/shared/ui/SelectDateInput';
import TextArea from '@/shared/ui/TextArea';

const ExhibitionForm = ({
  defaultValues = {},
  mutation,
}: {
  defaultValues?: Partial<ExhibitionFormData>;
  mutation: MutationType;
}) => {
  const { register, control, handleSubmit, setValue, watch } =
    useForm<ExhibitionFormData>({
      defaultValues: {
        title: '',
        introduction: '',
        startedDay: '',
        finishedDay: '',
        image: '',
        address: '',
        location: '',
        trainings: [],
        standard: [],
        ...defaultValues,
      },
    });

  const onSubmit = (data: ExhibitionFormData) => {
    mutation.mutate(data);
  };

  const { openAddressSearch } = useAddressSearch(setValue);

  const trainingFields = useFieldArray<ExhibitionFormData>({
    control,
    name: 'trainings',
  });

  const standardFields = useFieldArray<ExhibitionFormData>({
    control,
    name: 'standard',
  });

  register('startedDay', { required: '박람회 시작 일과 시간을 입력해주세요.' });
  register('finishedDay', {
    required: '박람회 종료 일과 시간을 입력해주세요.',
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        handleFormErrors(errors, showError);
      })}
      method="POST"
      className="flex w-full max-w-[816px] flex-1 flex-col overflow-y-auto"
    >
      <DetailHeaderEditable
        registration={register('title', {
          required: '제목을 입력해주세요.',
        })}
        textCenter={true}
      />
      <div className="mt-44 space-y-28">
        <div className="space-y-8">
          <p className="text-h3b text-black">사진 등록</p>
          <ImageInput
            register={register('image', { required: '사진을 등록해주세요.' })}
            setValue={setValue}
            id="imageUpload"
            defaultImage={defaultValues.image}
          />
        </div>
        <div className="space-y-8">
          <p className="text-h3b text-black">제목</p>
          <Input
            {...register('title', { required: '제목을 입력해주세요.' })}
            type="text"
            placeholder="제목을 입력해주세요."
          />
        </div>
        <div className="space-y-8">
          <p className="text-h3b text-black">박람회 기간</p>
          <div className="space-y-8">
            <div className="flex items-center gap-7">
              <SelectDateInput
                value={
                  watch('startedDay') ? new Date(watch('startedDay')) : null
                }
                onChange={(date) =>
                  setValue('startedDay', date ? format(date, 'yyyy-MM-dd') : '')
                }
                placeholder="시작일"
              />
              <SelectDateInput
                value={
                  watch('finishedDay') ? new Date(watch('finishedDay')) : null
                }
                onChange={(date) =>
                  setValue(
                    'finishedDay',
                    date ? format(date, 'yyyy-MM-dd') : '',
                  )
                }
                placeholder="마감일"
              />
            </div>
          </div>
        </div>
        <TextArea
          title="초대의 글"
          placeholder="초대의 글을 작성해주세요."
          maxLength={1000}
          registration={register('introduction', {
            required: '초대의 글을 입력해주세요.',
          })}
          row={1}
          value={watch('introduction')}
        />
        <div className="space-y-8">
          <p className="text-h3b text-black">연수 프로그램</p>
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
        <div className="space-y-8">
          <p className="text-h3b text-black">참가자 프로그램</p>
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
        <div className="space-y-8">
          <p className="text-h3b text-black">장소</p>
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
        >
          확인
        </Button>
      </div>
    </form>
  );
};

export default ExhibitionForm;
