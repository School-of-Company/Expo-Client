'use client';

import { Button } from '@/shared/ui';
import { useRetryProgramChangesMutation } from '../../model/useRetryProgramChangesMutation';

// pendingRevision이 남은 프로그램이 있으면 수정이 409로 막히므로 재시도를 먼저 안내한다
const ProgramChangeRetryNotice = ({
  id,
  onRetried,
}: {
  id: string;
  onRetried: () => void;
}) => {
  const { mutate, isPending } = useRetryProgramChangesMutation(id, onRetried);

  return (
    <div className="flex items-center justify-between gap-12 rounded-sm border-1 border-solid border-main-600 px-[20px] py-[12px] mobile:flex-col mobile:items-stretch">
      <p className="text-body2r text-gray-500">
        이전 프로그램 변경이 끝나지 않았습니다. 재시도해 마무리한 뒤
        수정해주세요. 재시도하면 작성 중인 내용은 최신 내용으로 바뀝니다.
      </p>
      <Button
        variant="white"
        width="120px"
        disabled={isPending}
        onClick={() => mutate()}
      >
        변경 재시도
      </Button>
    </div>
  );
};

export default ProgramChangeRetryNotice;
