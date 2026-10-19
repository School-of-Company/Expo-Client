'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { hasUnsavedChanges, useModalDialog } from '@/shared/model';
import { useLogoutParticipantSession } from '../../model/useLogoutParticipantSession';
import { useParticipantSession } from '../../model/useParticipantSession';

const ConfirmDialog = ({
  onConfirm,
  onClose,
  disabled,
}: {
  onConfirm: () => void;
  onClose: () => void;
  disabled: boolean;
}) => {
  const dialogRef = useModalDialog({ onClose, canClose: !disabled });
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={disabled ? undefined : onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="로그아웃 확인"
        tabIndex={-1}
        className="flex w-full max-w-[360px] flex-col items-center gap-16 rounded-sm bg-white p-24 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-h3b text-black">로그아웃할까요?</p>
        <p className="break-keep text-center text-body2r text-gray-500">
          작성 중인 내용은 저장되지 않습니다.
        </p>
        <div className="flex w-full gap-8">
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="flex-1 rounded-sm border-1 border-solid border-gray-200 py-12 text-body2b text-gray-600"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className="flex-1 rounded-sm bg-main-600 py-12 text-body2b text-white disabled:opacity-50"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 휴대전화 인증이 살아 있을 때만 보이고, 누르면 인증을 해제한 뒤 인증 화면으로 보낸다.
 * 인증 뒤 지금 화면으로 돌아오되, 앞사람 번호가 담긴 phoneNumber 쿼리는 넘기지 않는다
 */
const ParticipantLogoutButton = ({ expoId }: { expoId: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: sessionState } = useParticipantSession(expoId);
  const { mutate: logout, isPending } = useLogoutParticipantSession(
    expoId,
    '로그아웃했습니다.',
  );
  const [isConfirming, setIsConfirming] = useState(false);

  if (!sessionState?.session) return null;

  const handleLogout = () =>
    logout(undefined, {
      onSuccess: () => {
        setIsConfirming(false);
        const query = new URLSearchParams(searchParams.toString());
        query.delete('phoneNumber');
        const rest = query.toString();
        const redirect = rest ? `${pathname}?${rest}` : pathname;
        router.replace(
          `/phone-verification?expoId=${encodeURIComponent(expoId)}&redirect=${encodeURIComponent(redirect)}`,
        );
      },
    });

  return (
    <>
      <button
        type="button"
        onClick={() =>
          hasUnsavedChanges() ? setIsConfirming(true) : handleLogout()
        }
        disabled={isPending}
        className="text-body2r text-gray-500 underline disabled:opacity-50 mobile:text-caption1r"
      >
        로그아웃
      </button>
      {isConfirming && (
        <ConfirmDialog
          onConfirm={handleLogout}
          onClose={() => setIsConfirming(false)}
          disabled={isPending}
        />
      )}
    </>
  );
};

export default ParticipantLogoutButton;
