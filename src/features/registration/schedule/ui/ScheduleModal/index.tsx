'use client';

import { XMark } from '@/shared/assets/icons';
import { useModalDialog } from '@/shared/model';

interface ScheduleModalProps {
  title: string;
  onClose: () => void;
  /** 저장하는 중처럼 닫으면 안 되는 동안 false */
  canClose?: boolean;
  /** 본문 아래에 고정되는 버튼 줄 */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** 일정·모집 화면의 등록·수정 양식을 담는 모달 */
const ScheduleModal = ({
  title,
  onClose,
  canClose = true,
  footer,
  children,
}: ScheduleModalProps) => {
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
        aria-label={title}
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-[720px] flex-col rounded-sm bg-white outline-none"
      >
        <div className="flex items-center justify-between gap-16 px-[32px] pb-16 pt-[28px] mobile:px-20">
          <p className="text-h3b text-black">{title}</p>
          <button
            type="button"
            onClick={onClose}
            disabled={!canClose}
            aria-label="닫기"
            className="-m-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center"
          >
            <XMark />
          </button>
        </div>
        <div className="space-y-20 overflow-y-auto px-[32px] py-8 mobile:px-20">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-12 px-[32px] pb-[28px] pt-20 mobile:flex-col-reverse mobile:px-20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleModal;
