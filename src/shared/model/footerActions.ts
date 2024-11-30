import axios from 'axios';
import { printBadge } from './printUtils';

export interface UserData {
  id: number;
  name: string;
  affiliation: string;
  qrCode: string;
}

export const fileActions = {
  exportPDF: () => window.print(),
  exportExcel: () => console.log('Excel 내보내기'),
};

export const printActions = (data: UserData[]) => ({
  PrintBadge: async (selectItem: number) => {
    const selectedData = data.find((item) => item.id === selectItem);
    console.log(selectedData);
    if (selectedData) {
      printBadge(selectedData);
    }
  },
});

export const checkActions = (fetchSignupList: () => Promise<void>) => ({
  CheckBadge: async (selectItem: number) => {
    try {
      await axios.patch(`/api/admin/${selectItem}`);
      await fetchSignupList();
    } catch (error) {
      console.error('Failed to check signup:', error);
    }
  },
  DeleteBadge: (selectItem: number) => console.log('삭제', selectItem),
});

export const deleteActions = (fetchExpoList: () => Promise<void>) => ({
  DeleteBadge: async (selectItem: number) => {
    try {
      await axios.delete(`/api/expo/${selectItem}`);
      await fetchExpoList();
    } catch (error) {
      console.error('Failed to delete expo:', error);
    }
  },
});
