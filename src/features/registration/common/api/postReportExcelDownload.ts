import { downloadExcelFile } from '@/shared/libs/downloadExcelFile';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ReportExcelDownloadRequest } from '@/shared/types/registration/type';

export const postReportExcelDownload = (
  expoId: string,
  request: ReportExcelDownloadRequest,
) =>
  downloadExcelFile(() =>
    clientTokenInstance.post<Blob>(
      `/excel/expos/${encodeURIComponent(expoId)}/downloads`,
      request,
      {
        headers: { 'X-File-Download': 'true' },
        responseType: 'blob',
      },
    ),
  );
