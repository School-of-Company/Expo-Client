'use client';

import React from 'react';
import { useModalDialog } from '@/shared/model';

interface Props {
  children: React.ReactNode;
  /** 화면리더가 읽을 대화상자 이름 */
  label: string;
  /** 없으면 Escape 로 닫지 않는다 */
  onClose?: () => void;
  /** 삭제 중처럼 닫으면 안 되는 동안 false */
  canClose?: boolean;
}

const ModalLayout = ({ children, label, onClose, canClose }: Props) => {
  const dialogRef = useModalDialog({ onClose, canClose });

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="flex max-h-full w-full justify-center outline-none"
      >
        {children}
      </div>
    </div>
  );
};

export default ModalLayout;
