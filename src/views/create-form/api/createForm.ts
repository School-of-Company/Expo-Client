import axios from 'axios';

export const createForm = async ({
  data,
  id,
}: {
  data: {
    informationImage: string;
    participantType: string;
    dynamicForm: {
      title: string;
      formType: string;
      jsonData: Record<string, string>;
    }[];
  };
  id: string;
}) => {
  const response = await axios.post(`/api/form/${id}`, data);
  return response;
};
