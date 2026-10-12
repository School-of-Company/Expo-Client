// 프로그램 모집 정책. 박람회 수정 요청에서 null로 보내면 기존 정책이 유지된다
export interface ProgramPolicy {
  groupId: string | null;
  formId: string;
  allowedOccupations: string[];
  capacity: number;
  waitingCapacity: number;
  applicationStartedAt: string;
  applicationEndedAt: string;
  cancelEndedAt: string;
  promotionEndedAt: string;
  closed: boolean;
}

export interface Program {
  id: number;
  expoId: string | null;
  programType: 'STANDARD' | 'TRAINING';
  groupId: string | null;
  policy: ProgramPolicy | null;
  // 조회한 정의 버전. 박람회 수정 요청에 그대로 돌려보낸다
  revision: number;
  // 중단된 변경이 남아 있으면 그 다음 버전, 없으면 null
  pendingRevision: number | null;
  title: string;
  startedAt: string;
  endedAt: string;
  category: 'ESSENTIAL' | 'CHOICE';
}
