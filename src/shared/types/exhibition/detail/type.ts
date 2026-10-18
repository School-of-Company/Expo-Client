import { Program, TrainingProgramItem } from '../../program/list/type';

export interface ExpoDetail {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string | null;
  // 경도·위도 문자열. 지도에 넘길 때 Number()로 바꾼다
  x: string;
  y: string;
  /** 새 사전등록 회차의 교사·예비교사 / 그 외 정원 기본값. null 이면 미설정 */
  preregisterTeacherCapacity?: number | null;
  preregisterNonTeacherCapacity?: number | null;
}

// 상세 화면은 프로그램 목록 응답에서 일정 표시에 필요한 필드만 쓴다
export type ExpoStandard = Pick<
  Program,
  'id' | 'title' | 'startedAt' | 'endedAt'
>;

export type ExpoTrainingDetail = ExpoStandard &
  Pick<TrainingProgramItem, 'category'>;

export interface ExpoTraining {
  essential: ExpoTrainingDetail[];
  choice: ExpoTrainingDetail[];
}
