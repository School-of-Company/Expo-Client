import type {
  EntryList,
  EntryListItem,
} from '@/shared/types/exhibition/check-in/entry';

// 페이지를 읽는 사이 새 입장이 앞에 끼면 다음 페이지에 같은 행이 또 온다. 참가 유형과 ID 로 한 번만 남긴다
export const mergeEntryPages = (
  pages: Pick<EntryList, 'entries'>[],
): EntryListItem[] => {
  const rows = new Map<string, EntryListItem>();
  for (const { entries } of pages) {
    for (const entry of entries) {
      const key = `${entry.participationType}-${entry.id}`;
      if (!rows.has(key)) rows.set(key, entry);
    }
  }
  return Array.from(rows.values());
};
