import { toast } from 'react-toastify';

export const showError = (message: string) => {
  toast.error(message);
};
