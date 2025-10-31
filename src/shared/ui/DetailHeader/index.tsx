'use client';

import { useRouter } from 'next/navigation';

import { ArrowLeft } from '@/shared/assets/icons';
import Input from '../Input';

interface Props {
  textCenter?: boolean;
  headerTitle?: string;
}

const DetailHeader = ({ textCenter = false, headerTitle }: Props) => {
  const router = useRouter();

  return (
    <div className="flex items-center">
      <label className="hover:cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft size={32} />
      </label>
      {!headerTitle && (
        <Input
          placeholder="폼의 제목을 입력해주세요"
          className={textCenter ? 'text-center' : ''}
          name="title"
        />
      )}
      {headerTitle && (
        <p
          className={`flex-grow text-h2r text-black mobile:text-body1r ${
            textCenter ? 'text-center' : ''
          }`}
        >
          {headerTitle}
        </p>
      )}
    </div>
  );
};

export default DetailHeader;
