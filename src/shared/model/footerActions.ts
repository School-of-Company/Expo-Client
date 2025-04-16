import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { AttendUserResponse } from '../types/name-tag/type';
import { printBadge } from './printUtils';

export interface UserData {
  id: number;
  name: string;
  phoneNumber: string;
  personalInformationStatus: string;
}

export const fileActions = (id: string | number) => ({
  exportExcel: async () => {
    try {
      const response = await axios.get(`/api/server/token/excel/${id}`, {
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
      console.error('Excel export failed:', error);
    }
  },
});

export const printActions = (data: AttendUserResponse[]) => ({
  PrintBadge: async (selectItem: number) => {
    const selectedData = data.find((item) => item.id === selectItem);
    if (selectedData) {
      const isTrainee = selectedData.participationType === 'TRAINEE';

      const qrPayload = {
        [isTrainee ? 'traineeId' : 'participantId']: selectedData.id,
        phoneNumber: selectedData.phoneNumber,
      };

      const badgeData = {
        name: selectedData.name,
        qrCode: JSON.stringify(qrPayload),
      };

      printBadge(badgeData);
    }
  },
});

export const checkActions = (fetchSignupList: () => Promise<void>) => ({
  CheckBadge: async (selectItem: number) => {
    try {
      await axios.patch(`/api/server/token/admin/${selectItem}`);
      await fetchSignupList();
      toast.success('회원가입 승인 성공');
    } catch (error) {
      console.error('Failed to check signup:', error);
    }
  },
  DeleteBadge: async (selectItem: number) => {
    try {
      await axios.delete(`/api/server/token/admin/${selectItem}`);
      await fetchSignupList();
      toast.success('회원가입 거절 성공');
    } catch (error) {
      console.error('Failed to check signup:', error);
    }
  },
});

export const deleteActions = (fetchExpoList: () => Promise<void>) => ({
  DeleteBadge: async (selectItem: number) => {
    try {
      await axios.delete(`/api/server/token/expo/${selectItem}`);
      await fetchExpoList();
      toast.success('박람회 삭제 성공');
    } catch (error) {
      toast.error('박람회 삭제 실패');
    }
  },
});

export const routeActions = (
  router: ReturnType<typeof useRouter>,
  navigation: string,
) => ({
  RouteActions: (id: number) => {
    router.push(`/program/detail/${id}?navigation=${navigation}`);
  },
});
