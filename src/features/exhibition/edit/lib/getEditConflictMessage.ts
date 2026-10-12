import { Program } from '@/shared/types/program/list/type';

export const hasPendingProgramChange = (programs: Program[]) =>
  programs.some((program) => program.pendingRevision != null);

// 서버는 409를 하나의 상태로 돌려주므로(변경 진행 중·신청 이력·동시 수정) 다시 조회한 상태와
// 요청 내용으로 원인을 좁혀 안내한다. 서버 문구가 있으면 함께 보여 준다
export const getEditConflictMessage = ({
  hasPendingChange,
  hasRemovedProgram,
  serverMessage,
}: {
  hasPendingChange: boolean;
  hasRemovedProgram: boolean;
  serverMessage?: string;
}) => {
  const guide = hasPendingChange
    ? '이전 프로그램 변경이 아직 끝나지 않았습니다. 변경 재시도 후 다시 저장해주세요.'
    : hasRemovedProgram
      ? '신청 이력이 있는 프로그램은 삭제할 수 없습니다. 삭제한 프로그램을 확인해주세요.'
      : '다른 곳에서 먼저 수정되었습니다. 새로고침 후 다시 시도해주세요.';

  return serverMessage ? `${guide} (${serverMessage})` : guide;
};
