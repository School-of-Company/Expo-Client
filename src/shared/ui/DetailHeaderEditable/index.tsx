'use client';

import { useRouter } from 'next/navigation';
import { UseFormRegisterReturn } from 'react-hook-form';

import { ArrowLeft } from '@/shared/assets/icons';
import Input from '../Input';

interface Props {
  textCenter?: boolean;
  registration: UseFormRegisterReturn;
}

const DetailHeaderEditable = ({ textCenter = false, registration }: Props) => {
  const router = useRouter();

  return (
    <div className="flex items-center">
      <label className="hover:cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft size={32} />
      </label>
      <Input
        placeholder="폼의 제목을 입력해주세요"
        className={`${textCenter ? 'text-center' : ''} flex-grow`}
        name={registration.name}
        onBlur={registration.onBlur}
        onChange={registration.onChange}
        ref={(el) => registration.ref(el)}
      />
    </div>
  );
};

export default DetailHeaderEditable;
