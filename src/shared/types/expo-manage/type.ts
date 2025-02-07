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

export interface Participant {
  id: number;
  name: string;
  phoneNumber: string;
  affiliation: string;
  position: string;
  informationJson: boolean;
}
