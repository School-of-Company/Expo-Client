import { useEffect, useRef, useState } from 'react';
import { toKstLocal } from '@/shared/libs/kstDateTime';
import {
  EMPTY_ENTRIES,
  entriesStorageKey,
  parseSavedEntries,
  serializeEntries,
  type SavedEntries,
} from './checkInEntries';

const todayKst = () => toKstLocal(new Date()).slice(0, 10);

/**
 * 이 화면에서 입장 처리한 참가자 표와 종이 QR 입장 수. 서버에는 오늘 입장자 목록을 다시 받을 API 가 없어
 * 화면을 나갔다 들어오면 사라지므로, 이 브라우저에 박람회별·행사일별로 저장해 두고 다시 보여 준다.
 * 개인정보를 남기지 않도록 연락처는 가려진 값으로 넣는다(저장하는 쪽이 가린다)
 */
export const useCheckInEntries = (expoId: string) => {
  const [state, setState] = useState<
    (SavedEntries & { expoId: string }) | null
  >(null);
  const loadedKey = useRef<string | null>(null);

  // 서버 렌더와 어긋나지 않도록 마운트한 뒤 읽고, 박람회가 바뀌면 그 박람회 값으로 다시 읽는다
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(entriesStorageKey(expoId));
    } catch {
      // 저장소를 쓸 수 없으면 비운 채 시작한다
    }
    loadedKey.current = entriesStorageKey(expoId);
    setState({ expoId, ...parseSavedEntries(raw, todayKst()) });
  }, [expoId]);

  // 다시 읽기 전 한 번의 렌더에도 이전 박람회 값을 쓰지 않는다
  const current = state?.expoId === expoId ? state : { ...EMPTY_ENTRIES };

  // 읽기 전(빈 값)을 저장해 기존 기록을 덮어쓰지 않도록 읽은 뒤에만 저장한다
  useEffect(() => {
    if (!state || state.expoId !== expoId) return;
    if (loadedKey.current !== entriesStorageKey(expoId)) return;
    try {
      localStorage.setItem(
        entriesStorageKey(expoId),
        serializeEntries(state, todayKst()),
      );
    } catch {
      // 저장하지 못해도 이번 화면에서는 쓴다
    }
  }, [state, expoId]);

  const update = (change: (prev: SavedEntries) => SavedEntries) =>
    setState((prev) => ({
      expoId,
      ...change(prev?.expoId === expoId ? prev : { ...EMPTY_ENTRIES }),
    }));

  return {
    entries: current.entries,
    paperQrCount: current.paperQrCount,
    // 같은 행이 겹쳐 들어오면(연속 스캔) 한 번만 넣는다
    addEntry: (entry: SavedEntries['entries'][number]) =>
      update((prev) =>
        prev.entries.some(
          (saved) =>
            saved.participationType === entry.participationType &&
            saved.id === entry.id,
        )
          ? prev
          : { ...prev, entries: [...prev.entries, entry] },
      ),
    addPaperQr: () =>
      update((prev) => ({ ...prev, paperQrCount: prev.paperQrCount + 1 })),
  };
};
