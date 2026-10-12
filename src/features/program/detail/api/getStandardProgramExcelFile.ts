import { toast } from 'react-toastify';
import { downloadExcelFile } from '@/shared/libs/downloadExcelFile';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

export const getStandardProgramExcelFile = async (
  expoId: string,
  programId: string,
) => {
  try {
    await downloadExcelFile(() =>
      clientTokenInstance.get<Blob>(
        `/excel/program/${expoId}?programId=${programId}`,
        {
          headers: {
            'X-File-Download': 'true',
          },
          responseType: 'blob',
        },
      ),
    );
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : '엑셀 파일을 만들지 못했습니다.',
    );
  }
};
