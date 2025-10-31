'use client';

import { useRouter } from 'next/navigation';

import { ArrowLeft } from '@/shared/assets/icons';

interface Props {
  textCenter?: boolean;
  headerTitle: string;
}

const DetailHeader = ({ textCenter = false, headerTitle }: Props) => {
  const router = useRouter();

  return (
    <div className="flex items-center">
      <label className="hover:cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft size={32} />
      </label>
      <p
        className={`flex-grow text-h2r text-black mobile:text-body1r ${
          textCenter ? 'text-center' : ''
        }`}
      >
        {headerTitle}
      </p>
    </div>
  );
};

export default DetailHeader;
