import { ProgramPolicy } from '../../program/list/type';

export interface CreateExhibitionData {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: string;
  y: string;
  addStandardProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
    policy?: ProgramPolicy | null;
  }[];
  addTrainingProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
    category: 'ESSENTIAL' | 'CHOICE';
    policy?: ProgramPolicy | null;
  }[];
}
