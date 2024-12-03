'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Input, RadioGroup } from '@/entities/application';
import TrainingRadioGroup from '@/entities/application/ui/TrainingRadioGroup';
import { Button } from '@/shared/ui';
import { handleTraineeFormsSubmit } from '@/widgets/application/model/applicationFormHandler';
import { TraineeForms } from '../../../../types/type';

const TraineeForm = ({ params }: { params: number }) => {
  const [trainingId, setTrainingId] = useState('');

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
  const router = useRouter();

  const schoolLevelOptions = [
    { value: '초등학교', label: '초등학교' },
    { value: '중학교', label: '중학교' },
    { value: '고등학교', label: '고등학교' },
    { value: '교육청', label: '교육청' },
    { value: '기타', label: '기타' },
  ];

  const yesNoOptions = [
    { value: 'yes', label: '예' },
    { value: 'no', label: '아니요' },
  ];

  const onSubmit = async (data: TraineeForms) => {
    try {
      await handleTraineeFormsSubmit(data, params);
      toast.success('신청 되었습니다.');

      if (trainingId && selectedValue) {
        const result = await TrainingRadioGroup.handleTrainingSubmit(
          selectedValue,
          trainingId,
        );
        console.log('Training Submit Result:', result);
      }

      const qrBody = {
        phoneNumber: data.phoneNumber,
        authority: 'ROLE_TRAINEE',
      };

      const response = await axios.post('/api/sms/qr', qrBody);
      console.log('QR SMS API Response:', response.data);
      toast.success('QR이 발송 되었습니다. 문자를 확인 해 주세요.');
      router.back();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
        console.error('API Error:', errorMessage);
        toast.error(`오류가 발생했습니다: ${errorMessage}`);
      } else {
        console.error('폼 제출 중 에러 발생:', error);
        toast.error('폼 제출에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleTrainingIdChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTrainingId(event.target.value);
  };
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

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
        onChange={handleTrainingIdChange}
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
      <TrainingRadioGroup
        label="연수 선택"
        name="test"
        params={params}
        trainingId={trainingId}
        selectedValue={selectedValue}
        setSelectedValue={setSelectedValue}
      />
      <Button text="신청하기" type="submit" />
    </form>
  );
};

export default TraineeForm;
