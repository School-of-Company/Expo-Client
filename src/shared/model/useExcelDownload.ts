'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  downloadExcel,
  ExcelDownloadParams,
} from '@/shared/libs/downloadExcelFile';

interface ExcelDownloadVariables {
  path: string;
  params?: ExcelDownloadParams;
}

/**
 * 엑셀 GET 다운로드. isPending 동안 버튼을 막아 같은 파일을 여러 번 요청하지 않게 한다.
 * 성공·실패 모두 토스트로 알린다
 */
export const useExcelDownload = () =>
  useMutation({
    mutationFn: ({ path, params }: ExcelDownloadVariables) =>
      downloadExcel(path, params),
    onSuccess: (saved) => {
      // 파일을 저장하지 않고 끝났으면(로그인 화면으로 이동 중) 성공 안내를 띄우지 않는다
      if (saved) toast.success('엑셀 파일을 내려받았습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
