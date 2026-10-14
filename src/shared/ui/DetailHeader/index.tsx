'use client';

import { useRouter } from 'next/navigation';

import { ArrowLeft } from '@/shared/assets/icons';

interface Props {
  textCenter?: boolean;
  headerTitle: string;
  /** 지정하면 router.back() 대신 쓴다. 직접 열어 이전 기록이 없는 화면에서 쓴다 */
  onBack?: () => void;
  className?: string;
}

const DetailHeader = ({
  textCenter = false,
  headerTitle,
  onBack,
  className = '',
}: Props) => {
  const router = useRouter();

  return (
    <div className={`flex items-center ${className}`}>
      <label
        className="hover:cursor-pointer"
        onClick={onBack ?? (() => router.back())}
      >
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
