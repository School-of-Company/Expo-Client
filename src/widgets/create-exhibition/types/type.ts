export type ExhibitionFormData = {
  title: string;
  introduction: string;
  address: string;
  location: string;
  trainings: { name: string }[];
  image: File | null;
  startedDay: string;
  finishedDay: string;
};
