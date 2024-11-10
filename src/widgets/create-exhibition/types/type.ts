export type ExhibitionFormData = {
  title: string;
  introduction: string;
  address: string;
  trainings: { name: string }[];
  image: File | null;
};
