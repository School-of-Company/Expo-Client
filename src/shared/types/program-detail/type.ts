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
  id: string;
  participantId: number;
  phoneNumber: string;
}

export interface PatchTrainingProgramData {
  id: string;
  traineeId: number;
}
