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
}

export interface ExpoTrainingDetail {
  id: number;
  title: string;
  startedAt: string;
  endedAt: string;
  category: 'ESSENTIAL' | 'CHOICE';
}

export interface ExpoTraining {
  essential: ExpoTrainingDetail[];
  choice: ExpoTrainingDetail[];
}

export interface ExpoStandard {
  id: number;
  title: string;
  startedAt: string;
  endedAt: string;
}
