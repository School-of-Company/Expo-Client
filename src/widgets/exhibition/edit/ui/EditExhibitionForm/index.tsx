'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ImageInput } from '@/entities/exhibition';
import TrainingModule from '@/entities/exhibition/ui/TrainingModule';
import WarningMessage from '@/entities/exhibition/ui/WarningMessage';
import { Location } from '@/shared/assets/icons';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import { ExhibitionFormData } from '@/shared/types/exhibition/create/type';
import { AddressResponse } from '@/shared/types/exhibition/edit/type';
import {
  ExpoDetail,
  ExpoStandard,
  ExpoTrainingDetail,
} from '@/shared/types/expo-detail/type';
import { Button, Input } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';
import { useAddressSearch } from '@/widgets/exhibition/model/useAddressSearch';
import { formatDateTime } from '../../model/formatDateTime';
import { useEditExhibitionMutation } from '../../model/useEditExhibitionMutation';

const EditExhibitionForm = ({
  expoDetail,
  geoQueryData,
  expoStandard,
  expoTraining,
  id,
}: {
  expoDetail: ExpoDetail;
  geoQueryData: AddressResponse;
  expoStandard: ExpoStandard[];
  expoTraining: {
    essential: ExpoTrainingDetail[];
    choice: ExpoTrainingDetail[];
  };
  id: number;
}) => {
  const { register, control, handleSubmit, setValue, watch } =
    useForm<ExhibitionFormData>({
      defaultValues: {
        title: expoDetail.title,
        introduction: expoDetail.description,
        startedDay: expoDetail.startedDay,
        finishedDay: expoDetail.finishedDay,
        image: expoDetail.coverImage,
        address: geoQueryData.documents[0]?.road_address?.address_name,
        location: expoDetail.location,
        trainings: [...expoTraining.essential, ...expoTraining.choice].map(
          (training) => ({
            id: training.id,
            title: training.title,
            startedAt: formatDateTime(training.startedAt),
            endedAt: formatDateTime(training.endedAt),
            category: training.category,
          }),
        ),
        standard: expoStandard.map((std) => ({
          id: std.id,
          title: std.title,
          startedAt: formatDateTime(std.startedAt),
          endedAt: formatDateTime(std.endedAt),
        })),
      },
    });

  const mutation = useEditExhibitionMutation(id);

  const onSubmit = (data: ExhibitionFormData) => {
    mutation.mutate(data);
    console.log(data);
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
        handleFormErrors(errors, showError);
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
            defaultImage={expoDetail.coverImage}
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
                    value:
                      /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
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
                    value:
                      /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
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
        <Button type="submit" text="확인" />
      </div>
    </form>
  );
};

export default EditExhibitionForm;
