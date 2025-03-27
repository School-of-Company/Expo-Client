'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ImageInput } from '@/entities/exhibition';
import TrainingModule from '@/entities/exhibition/ui/TrainingModule';
import WarningMessage from '@/entities/exhibition/ui/WarningMessage';
import { Location } from '@/shared/assets/icons';
import { handleFormErrors } from '@/shared/model/formErrorUtils';
import { ExhibitionFormData } from '@/shared/types/exhibition/create/type';
import { Button, Input } from '@/shared/ui';
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
      <div className="relative mb-[44px] flex items-center justify-center py-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="absolute left-[-24px] top-1/2 -translate-y-1/2"
          aria-label="뒤로가기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M20.7073 25.2924C20.8002 25.3854 20.8739 25.4957 20.9242 25.6171C20.9745 25.7384 21.0004 25.8686 21.0004 25.9999C21.0004 26.1313 20.9745 26.2614 20.9242 26.3828C20.8739 26.5042 20.8002 26.6145 20.7073 26.7074C20.6144 26.8004 20.5041 26.8741 20.3827 26.9243C20.2613 26.9746 20.1312 27.0005 19.9998 27.0005C19.8684 27.0005 19.7383 26.9746 19.6169 26.9243C19.4955 26.8741 19.3852 26.8004 19.2923 26.7074L9.29231 16.7074C9.19933 16.6146 9.12557 16.5043 9.07525 16.3829C9.02493 16.2615 8.99902 16.1314 8.99902 15.9999C8.99902 15.8685 9.02493 15.7384 9.07525 15.617C9.12557 15.4956 9.19933 15.3853 9.29231 15.2924L19.2923 5.29245C19.4799 5.10481 19.7344 4.99939 19.9998 4.99939C20.2652 4.99939 20.5197 5.1048 20.7073 5.29245C20.895 5.48009 21.0004 5.73458 21.0004 5.99995C21.0004 6.26531 20.895 6.5198 20.7073 6.70745L11.4136 15.9999L20.7073 25.2924Z"
              fill="#121212"
            />
          </svg>
        </button>

        <h2 className="text-center font-Pretendard text-h2r text-[#121212]">
          박람회 수정하기
        </h2>
      </div>

      <div className="space-y-[30px]">
        <div className="space-y-[10px]">
          <p className="text-h3b text-black">사진 등록</p>
          <ImageInput
            register={register('image', { required: '사진을 등록해주세요.' })}
            setValue={setValue}
            id="imageUpload"
            defaultImage={defaultValues.image}
          />
        </div>
        <div className="space-y-[10px]">
          <p className="text-h3b text-black">제목</p>
          <Input
            {...register('title', { required: '제목을 입력해주세요.' })}
            type="text"
            placeholder="제목을 입력해주세요."
          />
        </div>
        <div className="space-y-[10px]">
          <p className="text-h3b text-black">모집기간</p>
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
          <p className="text-h3b text-black">연수자 연수 종류</p>
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
          <p className="text-h3b text-black">참가자 연수 종류</p>
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
