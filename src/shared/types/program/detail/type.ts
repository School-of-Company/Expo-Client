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
