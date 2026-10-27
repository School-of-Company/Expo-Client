import type { AttendUserResponse } from '@/shared/types/exhibition/check-in/type';

// 박람회마다 따로 저장해 다른 박람회 값이 섞이지 않게 한다
export const entriesStorageKey = (expoId: string) => `checkInEntries:${expoId}`;

export interface SavedEntries {
  entries: AttendUserResponse[];
  paperQrCount: number;
}

export const EMPTY_ENTRIES: SavedEntries = { entries: [], paperQrCount: 0 };

/**
 * 저장해 둔 오늘 입장 기록을 읽는다. 날짜(한국 시각)가 오늘이 아니면 지난 행사일 기록이라 버리고,
 * 값이 깨졌으면 비운 채 시작한다
 */
export const parseSavedEntries = (
  raw: string | null,
  today: string,
): SavedEntries => {
  try {
    const saved = JSON.parse(raw ?? 'null');
    if (!saved || saved.date !== today || !Array.isArray(saved.entries))
      return EMPTY_ENTRIES;
    return {
      entries: saved.entries.filter(
        (entry: unknown): entry is AttendUserResponse =>
          !!entry &&
          typeof entry === 'object' &&
          typeof (entry as AttendUserResponse).name === 'string' &&
          'id' in entry &&
          'participationType' in entry,
      ),
      paperQrCount:
        Number.isInteger(saved.paperQrCount) && saved.paperQrCount > 0
          ? saved.paperQrCount
          : 0,
    };
  } catch {
    return EMPTY_ENTRIES;
  }
};

export const serializeEntries = (
  { entries, paperQrCount }: SavedEntries,
  today: string,
) => JSON.stringify({ date: today, entries, paperQrCount });
