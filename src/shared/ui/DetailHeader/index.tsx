'use client';

import { useRouter } from 'next/navigation';

import { ArrowLeft } from '@/shared/assets/icons';

interface Props {
  textCenter?: boolean;
  headerTitle: string;
  className?: string;
  /** 주면 브라우저 기록 대신 이 경로로 간다. URL 로 바로 들어와 이전 기록이 없을 때도 동작한다. */
  backHref?: string;
}

const DetailHeader = ({
  textCenter = false,
  headerTitle,
  className = '',
  backHref,
}: Props) => {
  const router = useRouter();

  return (
    <div className={`flex items-center ${className}`}>
      <label
        className="hover:cursor-pointer"
        onClick={() => (backHref ? router.push(backHref) : router.back())}
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
