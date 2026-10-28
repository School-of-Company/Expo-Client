import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  EntryList,
  EntryListItem,
} from '@/shared/types/exhibition/check-in/entry';
import { mergeEntryPages } from '../model/mergeEntryPages';

const PAGE_SIZE = 500;
// ponytail: 하루 입장자가 이보다 많으면 잘린다. 넘으면 표 페이지네이션으로 바꾼다
const MAX_PAGES = 20;

// 오늘(Asia/Seoul) 등록 QR 입장자 전원. 관리자 전용이고 종이 QR·간편입장은 담지 않는다
export const getEntryList = async (
  expoId: string,
): Promise<EntryListItem[]> => {
  try {
    const pages: EntryList[] = [];
    for (let page = 0; page < MAX_PAGES; page++) {
      const { data } = await clientTokenInstance.get<EntryList>(
        `/attendance/summary/${encodeURIComponent(expoId)}/entries`,
        { params: { page, size: PAGE_SIZE } },
      );
      pages.push(data);
      if ((page + 1) * PAGE_SIZE >= data.totalElements) break;
    }
    return mergeEntryPages(pages);
  } catch (error) {
    throw toApiError(error, '오늘 입장자 목록을 불러오지 못했습니다.');
  }
};
