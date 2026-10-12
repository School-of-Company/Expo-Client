import { toast } from 'react-toastify';
import { downloadExcelFile } from '@/shared/libs/downloadExcelFile';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

export const getClassExcelFile = async (id: string) => {
  try {
    // 프로그램 탭은 행사 전체 연수자와 신청 강연을 담은 교원 연수자 명단을 받는다
    await downloadExcelFile(() =>
      clientTokenInstance.get<Blob>(`/excel/${id}`, {
        headers: {
          'X-File-Download': 'true',
        },
        responseType: 'blob',
      }),
    );
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : '엑셀 파일을 만들지 못했습니다.',
    );
  }
};
