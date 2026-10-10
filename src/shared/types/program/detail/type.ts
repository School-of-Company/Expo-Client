export interface TrainingProgram {
  id: number;
  name: string;
  affiliation: string;
  position: string;
  programName: string;
  status: boolean;
  entryTime: string;
  leaveTime: string;
}

export interface StandardProgram {
  id: number;
  name: string;
  affiliation: string;
  position: string;
  programName: string;
  status: boolean;
  entryTime: string;
  leaveTime: string;
}

export interface PatchStandardProgramData {
  expoId: string;
  programId: string;
  participantId: number;
  // 입장 QR과 같은 참가자 QR의 code
  code: string;
}

export interface PatchTrainingProgramData {
  expoId: string;
  programId: string;
  traineeId: number;
}
