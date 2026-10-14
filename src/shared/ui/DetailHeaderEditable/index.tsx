'use client';

import { useRouter } from 'next/navigation';
import { UseFormRegisterReturn } from 'react-hook-form';

import { ArrowLeft } from '@/shared/assets/icons';
import Input from '../Input';

interface Props {
  textCenter?: boolean;
  registration: UseFormRegisterReturn;
  /** 링크로 바로 들어와 돌아갈 기록이 없을 때 갈 곳 */
  fallbackHref: string;
  /** 뒤로가기 옆에 보이는 화면 이름 (예: 참가자 설문 만들기) */
  heading: string;
}

const DetailHeaderEditable = ({
  textCenter = false,
  registration,
  fallbackHref,
  heading,
}: Props) => {
  const router = useRouter();

  return (
    // 뒤로가기는 제목 입력칸과 붙어 보이지 않게 윗줄에 따로 둔다
    <div className="flex flex-col gap-16">
      <div className="flex items-center gap-8">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() =>
            window.history.length > 1
              ? router.back()
              : router.push(fallbackHref)
          }
        >
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-h2r text-black mobile:text-body1r">{heading}</h1>
      </div>
      <Input
        placeholder="폼의 제목을 입력해주세요"
        className={textCenter ? 'text-center' : ''}
        name={registration.name}
        onBlur={registration.onBlur}
        onChange={registration.onChange}
        ref={(el) => registration.ref(el)}
      />
    </div>
  );
};

export default DetailHeaderEditable;
