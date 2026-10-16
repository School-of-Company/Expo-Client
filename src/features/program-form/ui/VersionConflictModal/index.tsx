'use client';

import { useModalDialog } from '@/shared/model';
import { Button } from '@/shared/ui';

interface Props {
  isPending: boolean;
  onReload: () => void;
  onReapply: () => void;
}

// 두 선택지 중 하나를 골라야 닫히므로 Escape 로 닫지 않는다. 포커스만 안에 가둔다
const VersionConflictModal = ({ isPending, onReload, onReapply }: Props) => {
  const dialogRef = useModalDialog();
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-conflict-title"
        tabIndex={-1}
        className="w-full max-w-[480px] space-y-[24px] rounded-sm bg-white px-30 py-30 outline-none"
      >
        <div className="space-y-8">
          <p id="version-conflict-title" className="text-h2b text-black">
            다른 관리자가 먼저 수정했습니다
          </p>
          <p className="text-body2r text-gray-500">
            최신본을 다시 불러오면 지금 고친 내용은 사라집니다. 내 변경을
            유지하면 다른 관리자가 저장한 내용을 내 내용으로 덮어씁니다.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-16">
          <Button variant="gray" disabled={isPending} onClick={onReload}>
            최신본 불러오기
          </Button>
          <Button disabled={isPending} onClick={onReapply}>
            내 변경 유지하고 재적용
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VersionConflictModal;
