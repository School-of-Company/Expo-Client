import { postTraineeForms, postStandardForms } from '../api/formApi';
import { StandardForms, TraineeForms } from '../types/type';

export const handleStandardFormsSubmit = async (
  data: StandardForms,
  params: number,
) => {
  await postStandardForms(
    {
      name: data.name,
      phoneNumber: data.phoneNumber,
      affiliation: data.affiliation,
      position: data.position,
      informationStatus:
        (data.informationStatus as unknown as string) === 'yes',
    },
    params,
    true,
  );
};
export const handleTraineeFormsSubmit = async (
  data: TraineeForms,
  params: number,
) => {
  await postTraineeForms(
    {
      trainingId: data.trainingId,
      laptopStatus: (data.laptopStatus as unknown as string) === 'yes',
      phoneNumber: data.phoneNumber,
      position: data.position,
      schoolLevel: data.schoolLevel,
      organization: data.organization,
      name: data.name,
      informationStatus:
        (data.informationStatus as unknown as string) === 'yes',
    },
    params,
    false,
  );
};
