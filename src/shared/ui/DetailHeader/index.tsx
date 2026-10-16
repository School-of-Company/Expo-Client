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
      {/* 키보드로도 누를 수 있게 버튼으로 두고, 아이콘 크기는 그대로 누르는 영역만 44px 로 넓힌다 */}
      <button
        type="button"
        aria-label="뒤로 가기"
        className="-m-6 flex h-[44px] w-[44px] flex-none items-center justify-center"
        onClick={onBack ?? (() => router.back())}
      >
        <ArrowLeft size={32} />
      </button>
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
