interface TrainingProgram {
  programName: string;
}

export interface Trainee {
  id: number;
  name: string;
  trainingProgram: TrainingProgram[];
  trainingId: string;
  laptopStatus: boolean;
}

export interface TraineeResponse {
  info: {
    totalPage: number;
    totalElement: number;
  };
  participants: Trainee[];
}

export interface participants {
  id: number;
  name: string;
  phoneNumber: string;
  informationStatus: boolean;
}

export interface ParticipantResponse {
  info: {
    totalPage: number;
    totalElement: number;
  };
  participants: participants[];
}
