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

/**
 * 일반 프로그램 회차 명단 요청. 예전 GET /excel/program 은 회차 신청의 폼 답변·신청 경로·신청 시각 열이 없어,
 * 일정 표·프로그램 상세 어디서 받아도 같은 파일이 나오도록 이 확정 신청 다운로드 하나만 쓴다(Expo-Report-Server#77)
 */
export const programRosterRequest = (
  programId: number,
): ReportExcelDownloadRequest => ({
  template: 'PROGRAM',
  scope: 'FILTER',
  programId,
  filter: { programType: 'STANDARD', programId, status: ['CONFIRMED'] },
});
