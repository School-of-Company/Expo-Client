import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { SignUpData } from '@/shared/types/signup/type';
import { Input } from '@/shared/ui';

interface NameInputProps {
  register: UseFormRegister<SignUpData>;
  errors: FieldErrors<SignUpData>;
}

const NameInput = ({ register, errors }: NameInputProps) => (
  <div className="space-y-8">
    <p className="text-h3b text-black">이름</p>
    <Input
      {...register('name', { required: '이름을 입력해주세요.' })}
      type="text"
      placeholder="이름을 입력해주세요."
      error={!!errors.name}
    />
    {errors.name && (
      <p className="text-caption1r text-error">{errors.name.message}</p>
    )}
  </div>
);

export default NameInput;
