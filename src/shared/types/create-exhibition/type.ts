export interface CreateExhibitionData {
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
  location: string;
  coverImage: string;
  x: number;
  y: number;
  addStandardProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
  }[];
  addTrainingProRequestDto: {
    title: string;
    startedAt: string;
    endedAt: string;
    category: 'ESSENTIAL' | 'CHOICE';
  }[];
}
