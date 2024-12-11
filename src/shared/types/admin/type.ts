export interface ExpoItem extends Record<string, unknown> {
  id: number;
  coverImage: string;
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
}

export interface SignUpItem extends Record<string, unknown> {
  id: number;
  name: string;
  nickname: string;
  email: string;
  phoneNumber: string;
}
