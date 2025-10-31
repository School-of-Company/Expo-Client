'use client';

import { useRouter } from 'next/navigation';

import { ArrowLeft } from '@/shared/assets/icons';
import Input from '../Input';

interface Props {
  textCenter?: boolean;
}

const DetailHeaderEditable = ({ textCenter = false }: Props) => {
  const router = useRouter();

  return (
    <div className="flex items-center">
      <label className="hover:cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft size={32} />
      </label>
      <Input
        placeholder="폼의 제목을 입력해주세요"
        className={`${textCenter ? 'text-center' : ''} flex-grow`}
        name="title"
        aria-hidden={false}
      />
    </div>
  );
};

export default DetailHeaderEditable;
