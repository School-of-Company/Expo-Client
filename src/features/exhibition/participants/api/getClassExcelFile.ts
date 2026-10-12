import { toast } from 'react-toastify';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

export const getClassExcelFile = async (id: string) => {
  try {
    // 프로그램 탭은 행사 전체 연수자와 신청 강연을 담은 교원 연수자 명단을 받는다
    const response = await clientTokenInstance.get(`/excel/${id}`, {
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
  } catch {
    toast.error('파일 설치 실패');
  }
};
