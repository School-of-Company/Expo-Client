'use client';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Input, RadioGroup } from '@/entities/application';
import { Button } from '@/shared/ui';
import { handleStandardFormsSubmit } from '@/widgets/application/model/applicationFormHandler';
import { StandardForms } from '../../../../types/type';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// import TrainingRadioGroup from '@/entities/application/ui/TrainingRadioGroup';

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
  const router = useRouter();

  const yesNoOptions = [
    { value: 'yes', label: '예' },
    { value: 'no', label: '아니요' },
  ];

  const onSubmit = async (data: StandardForms) => {
    try {
      await handleStandardFormsSubmit(data, params);
      toast.success('신청 되었습니다.');

      const qrBody = {
        phoneNumber: data.phoneNumber,
        authority: 'ROLE_STANDARD',
      };

      const response = await axios.post('/api/sms/qr', qrBody);
      console.log('QR SMS API Response:', response.data);
      toast.success('QR이 발송 되었습니다. 문자를 확인 해 주세요.');
      router.back();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
        console.error('QR SMS API Error:', errorMessage);
        toast.error(`QR SMS API 호출에 실패했습니다: ${errorMessage}`);
      } else {
        console.error('폼 제출 중 에러 발생:', error);
        toast.error('폼 제출에 실패했습니다. 다시 시도해주세요.');
      }
    }
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
      {/* <TrainingRadioGroup label="연수 선택" name="test" params={params} trainingId={}/> */}

      <Button text="신청하기" type="submit" />
    </form>
  );
};

export default StandardForm;
