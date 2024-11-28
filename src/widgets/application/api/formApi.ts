import axios from 'axios';
import { StandardForms, TraineeForms } from '../types/type';

export const postTraineeForms = async (
  data: TraineeForms,
  params: number,
  site: boolean,
) => {
  try {
    const url = site ? `/api/form/trainee/${params}` : `/api/form/${params}`;
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error('Error postApplication', error);
    throw error;
  }
};

export const postStandardForms = async (
  data: StandardForms,
  params: number,
  site: boolean,
) => {
  try {
    const url = site
      ? `/api/form/standard/${params}`
      : `/api/form/pre-standard/${params}`;
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error('Error postApplication', error);
    throw error;
  }
};
