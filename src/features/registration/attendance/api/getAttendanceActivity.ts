import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { toPeriodParams } from './getAttendanceSummary';

// Expo-Attendance-Server EntryStatsResDto. 모두 관리자 전용이다

export interface HourlyEntryBucket {
  date: string;
  /** 0~23시(Asia/Seoul) */
  hour: number;
  entered: number;
  exited: number;
}

export type EntryRecordType = 'ENTER' | 'EXIT' | 'CANCEL';

export type EntryMethod =
  | 'REGISTERED_STANDARD'
  | 'REGISTERED_TRAINEE'
  | 'PAPER_QR'
  | 'WALK_IN';

export interface EntryRecord {
  /** 시간대 없는 지역 일시 */
  at: string;
  type: EntryRecordType;
  method: EntryMethod;
  /** 종이 QR 은 ADULT·CHILD 등, 간편입장은 참가 유형 8종(예전 기록은 ADULT·STUDENT) */
  category: string | null;
  /** 등록 QR 이고 유저 서비스가 이름을 돌려줄 때만 있다 */
  name: string | null;
  /** X-Scanner-Name 을 보내지 않은 처리는 비어 있다 */
  scanner: string | null;
}

export interface ScannerEntryCount {
  scanner: string;
  entered: number;
  exited: number;
}

const statsUrl = (expoId: string, path: string) =>
  `/attendance/summary/${encodeURIComponent(expoId)}/${path}`;

/** 기록이 있는 시간만 온다 */
export const getHourlyEntries = async (
  expoId: string,
  date: string | null,
): Promise<HourlyEntryBucket[]> => {
  try {
    const response = await clientTokenInstance.get<{
      buckets: HourlyEntryBucket[];
    }>(statsUrl(expoId, 'hourly'), { params: toPeriodParams(date) });
    return response.data.buckets ?? [];
  } catch (error) {
    throw toApiError(error, '시간대별 입·퇴장 건수를 불러오지 못했습니다.');
  }
};

/** 최신순 */
export const getRecentEntryRecords = async (
  expoId: string,
  date: string | null,
): Promise<EntryRecord[]> => {
  try {
    const response = await clientTokenInstance.get<{ records: EntryRecord[] }>(
      statsUrl(expoId, 'recent'),
      { params: { ...toPeriodParams(date), limit: 30 } },
    );
    return response.data.records ?? [];
  } catch (error) {
    throw toApiError(error, '최근 입·퇴장 기록을 불러오지 못했습니다.');
  }
};

/** 입장 처리가 많은 순 */
export const getScannerEntryCounts = async (
  expoId: string,
  date: string | null,
): Promise<ScannerEntryCount[]> => {
  try {
    const response = await clientTokenInstance.get<{
      scanners: ScannerEntryCount[];
    }>(statsUrl(expoId, 'scanners'), {
      params: { ...toPeriodParams(date), limit: 15 },
    });
    return response.data.scanners ?? [];
  } catch (error) {
    throw toApiError(error, '스캐너별 입장 처리 건수를 불러오지 못했습니다.');
  }
};
