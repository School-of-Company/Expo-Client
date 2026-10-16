import { useEffect, useState } from 'react';
import { SCANNER_NAME_MAX_LENGTH } from '../api/scannerNameHeader';
import type { ScanMode } from '../ui/ScanModeToggle';

// 박람회마다 따로 저장해 다른 박람회 값이 섞이지 않게 한다
const storageKey = (expoId: string) => `checkInScanner:${expoId}`;

// 브라우저는 헤더 값에 한글이 있으면 요청을 보내지 못해 영문·숫자·기호만 받는다
const SCANNER_NAME_PATTERN = /^[\x20-\x7E]*$/;

export const isValidScannerName = (name: string) =>
  SCANNER_NAME_PATTERN.test(name);

/** 입력한 이름을 서버 규칙(trim, 최대 40자)대로 다듬는다. 쓸 수 없는 값이면 빈 문자열 */
export const toScannerName = (raw: string) => {
  const name = raw.trim().slice(0, SCANNER_NAME_MAX_LENGTH);
  return isValidScannerName(name) ? name : '';
};

interface ScannerSettings {
  scannerName: string;
  mode: ScanMode;
}

const DEFAULT_SETTINGS: ScannerSettings = { scannerName: '', mode: 'entry' };

const load = (expoId: string): ScannerSettings => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(storageKey(expoId)) ?? 'null',
    );
    return {
      scannerName:
        typeof saved?.scannerName === 'string'
          ? toScannerName(saved.scannerName)
          : '',
      mode: saved?.mode === 'exit' ? 'exit' : 'entry',
    };
  } catch {
    // 저장소를 쓸 수 없거나 값이 깨졌으면 기본값으로 시작한다
    return DEFAULT_SETTINGS;
  }
};

/** 이 브라우저에 박람회별로 저장한 스캐너 이름과 입장/퇴장 모드 */
export const useScannerSettings = (expoId: string) => {
  const [state, setState] = useState<
    (ScannerSettings & { expoId: string }) | null
  >(null);

  // 서버 렌더와 어긋나지 않도록 마운트한 뒤 읽고, 박람회가 바뀌면 그 박람회 값으로 다시 읽는다
  useEffect(() => {
    setState({ expoId, ...load(expoId) });
  }, [expoId]);

  // 다시 읽기 전 한 번의 렌더에도 이전 박람회 값을 쓰지 않는다
  const settings = state?.expoId === expoId ? state : DEFAULT_SETTINGS;

  const update = (patch: Partial<ScannerSettings>) => {
    const next = { ...settings, ...patch };
    setState({ expoId, ...next });
    try {
      localStorage.setItem(
        storageKey(expoId),
        JSON.stringify({ scannerName: next.scannerName, mode: next.mode }),
      );
    } catch {
      // 저장하지 못해도 이번 화면에서는 쓴다
    }
  };

  return {
    scannerName: settings.scannerName,
    mode: settings.mode,
    setScannerName: (scannerName: string) => update({ scannerName }),
    setMode: (mode: ScanMode) => update({ mode }),
  };
};
