import { toast } from 'react-toastify';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

export const getClassExcelFile = async (id: string) => {
  try {
    const response = await clientTokenInstance.get(`/trainee/class/${id}`, {
      headers: {
        'X-File-Download': 'true',
      },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'export.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    toast.error('파일 설치 실패');
  }
};
