'use client';
import { useForm } from 'react-hook-form';
import { Input, RadioGroup } from '@/entities/application';
import { Button } from '@/shared/ui';
import { handleStandardFormsSubmit } from '@/widgets/application/model/applicationFormHandler';
import { StandardForms } from '../../../../types/type';

const StandardForm = ({ params }: { params: number }) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<StandardForms>({
    defaultValues: {
      name: '',
      phoneNumber: '',
      affiliation: '',
      position: '',
      informationStatus: false,
    },
  });

  const yesNoOptions = [
    { value: 'yes', label: '예' },
    { value: 'no', label: '아니요' },
  ];

  const onSubmit = (data: StandardForms) => {
    handleStandardFormsSubmit(data, params);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[28px]"
    >
      <Input
        {...register('name', { required: '이름을 입력해주세요.' })}
        type="text"
        label="이름"
        placeholder="이름"
        error={errors.name?.message}
      />
      <Input
        {...register('phoneNumber', { required: '전화번호를 입력해주세요.' })}
        type="text"
        label="전화번호"
        placeholder="전화번호"
        error={errors.phoneNumber?.message}
      />
      <Input
        {...register('affiliation', { required: '소속을 입력해주세요.' })}
        type="text"
        label="소속"
        placeholder="소속"
        error={errors.affiliation?.message}
      />
      <RadioGroup
        control={control}
        name="informationStatus"
        label="개인정보 동의"
        options={yesNoOptions}
        error={errors.informationStatus?.message}
      />

      <Button text="신청하기" type="submit" />
    </form>
  );
};

export default StandardForm;
