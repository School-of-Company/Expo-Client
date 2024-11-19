import axios from 'axios';

export const fileActions = {
  exportPDF: () => console.log('PDF 내보내기'),
  exportExcel: () => console.log('Excel 내보내기'),
};

export const printActions = {
  printBadge: () => console.log('명찰 출력'),
};

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
