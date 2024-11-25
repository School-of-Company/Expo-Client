export type ExhibitionFormData = {
  title: string;
  introduction: string;
  address: string;
  location: string;
  trainings: { title: string; startedAt: string; endedAt: string }[];
  image: File | null;
  startedDay: string;
  finishedDay: string;
};
