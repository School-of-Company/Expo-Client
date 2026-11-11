'use client';

import { useState } from 'react';
import { useModalDialog } from '@/shared/model';

const ConfirmDialog = ({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const dialogRef = useModalDialog({ onClose });
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="처음부터 작성 확인"
        tabIndex={-1}
        className="flex w-full max-w-[360px] flex-col items-center gap-16 rounded-sm bg-white p-24 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-h3b text-black">처음부터 작성할까요?</p>
        <p className="break-keep text-center text-body2r text-gray-500">
          작성하던 내용이 모두 지워집니다.
        </p>
        <div className="flex w-full gap-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-sm border-1 border-solid border-gray-200 py-12 text-body2b text-gray-600"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-sm bg-main-600 py-12 text-body2b text-white"
          >
            지우기
          </button>
        </div>
      </div>
    </div>
  );
};

/** 자동 저장된 작성 내용을 지운다. 되돌릴 수 없어 한 번 더 묻는다 */
const ResetDraftButton = ({ onReset }: { onReset: () => void }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="text-caption1r text-main-600 underline"
      >
        처음부터 작성
      </button>
      {isConfirming && (
        <ConfirmDialog
          onConfirm={() => {
            onReset();
            setIsConfirming(false);
          }}
          onClose={() => setIsConfirming(false)}
        />
      )}
    </>
  );
};

export default ResetDraftButton;
