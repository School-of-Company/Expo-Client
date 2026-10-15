'use client';

import Link from 'next/link';
import { useRegistrationExpo } from '@/features/registration/common';
import { withLoading } from '@/shared/hocs';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { Header } from '@/widgets/layout';

/**
 * 박람회 관리 하위 화면은 경로의 박람회를 전제로 동작한다. 박람회를 불러오기 전에는 그리지 않고,
 * 없는 박람회거나 조회에 실패하면 화면 대신 안내를 보여 준다.
 */
const RegistrationExpoGuard = ({ children }: { children: React.ReactNode }) => {
  const { expo, isExpoLoading, expoError, refetchExpo } = useRegistrationExpo();

  if (expo) return <>{children}</>;

  const isNotFound = getErrorStatus(expoError) === 404;

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      {withLoading({
        isLoading: isExpoLoading,
        children: (
          <div className="flex flex-1 flex-col items-center justify-center gap-24 p-16 text-center">
            <p className="text-h2b text-black">
              {isNotFound
                ? '박람회를 찾을 수 없습니다.'
                : '박람회 정보를 불러오지 못했습니다.'}
            </p>
            <div className="flex gap-12">
              {!isNotFound && (
                <button
                  type="button"
                  onClick={() => refetchExpo()}
                  className="rounded-sm bg-main-600 px-24 py-12 text-body2r text-white"
                >
                  다시 시도
                </button>
              )}
              <Link
                href="/"
                className="rounded-sm border-1 border-solid border-gray-200 px-24 py-12 text-body2r text-black"
              >
                박람회 목록으로
              </Link>
            </div>
          </div>
        ),
      })}
    </div>
  );
};

export default RegistrationExpoGuard;
