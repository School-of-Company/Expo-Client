'use client';

import { usePathname } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ImageInput } from '@/entities/exhibition';
import TrainingModule from '@/entities/exhibition/ui/TrainingModule';
import WarningMessage from '@/entities/exhibition/ui/WarningMessage';
import { Location } from '@/shared/assets/icons';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import { ExhibitionFormData } from '@/shared/types/exhibition/create/type';
import { Button, Input } from '@/shared/ui';
import DetailHeader from '@/shared/ui/DetailHeader';
import TextArea from '@/shared/ui/TextArea';
import { useAddressSearch } from '@/widgets/exhibition/model/useAddressSearch';
import { useCreateExhibitionMutation } from '../../create/model/useCreateExhibitionMutation';
import { useEditExhibitionMutation } from '../../edit/model/useEditExhibitionMutation';

const ExhibitionForm = ({
  defaultValues = {},
  mutation,
}: {
  defaultValues?: Partial<ExhibitionFormData>;
  mutation:
    | ReturnType<typeof useEditExhibitionMutation>
    | ReturnType<typeof useCreateExhibitionMutation>;
}) => {
  const pathname = usePathname();
  const isEditMode = pathname.includes('/edit');

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
      <DetailHeader
        headerTitle={isEditMode ? '박람회 수정하기' : '박람회 생성하기'}
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
        <div className="space-y-8">
          <p className="text-h3b text-black">참가자 연수 종류</p>
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
          <p className="text-h3b text-black">연수자 프로그램</p>
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
        <Button type="submit">확인</Button>
      </div>
    </form>
  );
};

export default ExhibitionForm;
