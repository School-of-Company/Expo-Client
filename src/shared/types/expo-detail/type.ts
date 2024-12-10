export interface ExpoDetail {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: number;
  y: number;
}

export interface ExpoTrainingDetail {
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
  title: string;
  startedAt: string;
  endedAt: string;
}
