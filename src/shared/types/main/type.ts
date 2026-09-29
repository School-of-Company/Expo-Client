export interface ExpoItem extends Record<string, unknown> {
  id: string;
  coverImage: string | null;
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
}

export interface OptionType {
  value: string;
  label: string;
  status: boolean;
}
