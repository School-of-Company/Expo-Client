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
    onSuccess: (saved) => {
      // 파일을 저장하지 않고 끝났으면(로그인 화면으로 이동 중) 성공 안내·모달 닫기를 하지 않는다
      if (!saved) return;
      toast.success('엑셀 파일을 내려받았습니다.');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
