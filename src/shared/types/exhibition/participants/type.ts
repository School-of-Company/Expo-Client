import { ApplicationType } from '@/shared/types/exhibition/type';

export interface Trainee {
  id: number;
  name: string;
  trainingId: string | null;
  phoneNumber: string | null;
  applicationType: ApplicationType;
}

export type TraineeResponse = Trainee[];

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
