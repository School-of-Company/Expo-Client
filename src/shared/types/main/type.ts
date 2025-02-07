export interface ExpoItem extends Record<string, unknown> {
  id: number;
  coverImage: string;
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
}
