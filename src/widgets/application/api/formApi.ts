import axios from 'axios';
import { StandardForms, TraineeForms } from '../types/type';

export const postTraineeForms = async (
  data: TraineeForms,
  params: number,
  site: boolean,
) => {
  try {
    const url = site
      ? `/api/application/field/${params}`
      : `/api/application/${params}`;
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
      ? `/api/application/field/standard/${params}`
      : `/api/application/pre-standard/${params}`;
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error('Error postApplication', error);
    throw error;
  }
};
