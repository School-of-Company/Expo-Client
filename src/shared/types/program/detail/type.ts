export interface TrainingProgram {
  id: number;
  name: string;
  programName: string;
  status: boolean;
  entryTime: string | null;
  leaveTime: string | null;
}

export interface StandardProgram {
  id: number;
  name: string;
  programName: string;
  status: boolean;
  entryTime: string | null;
  leaveTime: string | null;
}

export interface PatchStandardProgramData {
  expoId: string;
  programId: string;
  participantId: number;
  // 입장 QR과 같은 참가자 QR의 code. 예전 QR에는 없어 보내지 않는다
  code?: string;
}

export interface PatchTrainingProgramData {
  expoId: string;
  programId: string;
  // 연수자 QR이면 traineeId, 사전등록 참가자 QR이면 participantId와 code를 보낸다
  traineeId?: number;
  participantId?: number;
  code?: string;
}

/** 프로그램 스캔 응답. 예전 서버는 본문이 없어 모든 값이 비어 올 수 있다 */
export interface ProgramScanResponse {
  // UNCHANGED는 같은 분 안의 연속 스캔이거나 퇴실한 뒤라 바뀐 것이 없다는 뜻이다
  result?: 'ENTERED' | 'LEFT' | 'UNCHANGED';
  name?: string | null;
  // 이번에 기록한 입실·퇴실 시각('HH:mm')
  time?: string | null;
}
