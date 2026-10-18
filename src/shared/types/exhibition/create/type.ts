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
  /** 두 값은 함께 보내거나 함께 생략한다. 생략하면 서버가 기존 값을 쓴다 */
  preregisterTeacherCapacity?: number | null;
  preregisterNonTeacherCapacity?: number | null;
  addStandardProRequestDto: StandardProgramRequest[];
  addTrainingProRequestDto: TrainingProgramRequest[];
}
