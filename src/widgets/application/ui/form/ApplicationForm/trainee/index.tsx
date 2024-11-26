'use client';

import { Button } from '@/shared/ui';
import { Input, RadioGroup } from '@/entities/application';
import { useForm } from 'react-hook-form';
import { TraineeForms } from '../../../../types/type';
import { handleTraineeFormsSubmit } from '@/widgets/application/model/applicationFormHandler';

const TraineeForm = ({ params }: { params: number }) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TraineeForms>({
    defaultValues: {
      trainingId: '',
      laptopStatus: false,
      phoneNumber: '',
      position: '',
      schoolLevel: '',
      organization: '',
      name: '',
      informationStatus: false,
    },
  });

  const schoolLevelOptions = [
    { value: 'elementary', label: '초등학교' },
    { value: 'middle', label: '중학교' },
    { value: 'high', label: '고등학교' },
    { value: 'education', label: '교육청' },
    { value: 'other', label: '기타' },
  ];

  const yesNoOptions = [
    { value: 'yes', label: '예' },
    { value: 'no', label: '아니요' },
  ];

  const onSubmit = (data: TraineeForms) => {
    handleTraineeFormsSubmit(data, params);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[28px]"
    >
      <Input
        {...register('trainingId', { required: '연수 아이디를 입력해주세요.' })}
        type="text"
        label="연수 아이디"
        placeholder="연수 아이디"
        error={errors.trainingId?.message}
      />
      <RadioGroup
        control={control}
        name="laptopStatus"
        label="개인 노트북 지참 여부"
        options={yesNoOptions}
        error={errors.laptopStatus?.message}
        rules={{ required: '개인 노트북 지참 여부를 선택해주세요.' }}
      />
      <Input
        {...register('phoneNumber', { required: '전화번호를 입력해주세요.' })}
        type="text"
        label="전화번호"
        placeholder="전화번호"
        error={errors.phoneNumber?.message}
      />
      <Input
        {...register('position', { required: '직급을 입력해주세요.' })}
        type="text"
        label="직급"
        placeholder="직급"
        error={errors.position?.message}
      />
      <RadioGroup
        control={control}
        name="schoolLevel"
        label="학교급"
        options={schoolLevelOptions}
        error={errors.schoolLevel?.message}
      />
      <Input
        {...register('organization', { required: '조직을 입력해주세요.' })}
        type="text"
        label="소속,기관"
        placeholder="소속,기관"
        error={errors.organization?.message}
      />
      <Input
        {...register('name', { required: '이름을 입력해주세요.' })}
        type="text"
        label="이름"
        placeholder="이름"
        error={errors.name?.message}
      />
      <RadioGroup
        control={control}
        name="informationStatus"
        label="개인정보 동의 여부"
        options={yesNoOptions}
        error={errors.informationStatus?.message}
      />

      <Button text="신청하기" type="submit" />
    </form>
  );
};

export default TraineeForm;
