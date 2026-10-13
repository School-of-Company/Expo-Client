import {
  StandardProgramRequest,
  TrainingProgramRequest,
} from '../../program/list/type';

export interface CreateExhibitionData {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: string;
  y: string;
  addStandardProRequestDto: StandardProgramRequest[];
  addTrainingProRequestDto: TrainingProgramRequest[];
}
