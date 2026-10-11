import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ReportExcelDownloadRequest } from '@/shared/types/registration/type';
import { postReportExcelDownload } from '../api/postReportExcelDownload';

export const useReportExcelDownload = (onSuccess: () => void) =>
  useMutation({
    mutationFn: ({
      expoId,
      request,
    }: {
      expoId: string;
      request: ReportExcelDownloadRequest;
    }) => postReportExcelDownload(expoId, request),
    onSuccess: () => {
      toast.success('엑셀 파일을 내려받았습니다.');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
