import { useMemo } from 'react';
import { dateToString } from '../../common';
import {
  AttendanceMethod,
  getMockAttendanceActivity,
} from '../mock/attendanceActivity';
import { ALL_DAYS } from './attendanceSummary';

export const ATTENDANCE_METHOD_LABEL: Record<AttendanceMethod, string> = {
  STANDARD: '사전등록 QR · 일반',
  TRAINEE: '사전등록 QR · 연수',
  PAPER_ADULT: '현장 인쇄 QR · 성인',
  PAPER_CHILD: '현장 인쇄 QR · 어린이·학생',
  WALK_IN_ADULT: '간편입장 · 성인',
  WALK_IN_STUDENT: '간편입장 · 어린이·학생',
};

/**
 * 최근 10분 입장·시간대별 추이·최근 기록·스캐너별 건수.
 * 서버 API 가 없어 예시 데이터를 돌려준다. API 가 생기면 이 훅만 useQuery 로 바꾼다
 */
export const useAttendanceActivity = (
  expoId: string,
  day: string,
  days: string[],
) =>
  useMemo(
    () =>
      getMockAttendanceActivity(
        expoId,
        day === ALL_DAYS ? days : [day],
        day === dateToString(new Date()),
      ),
    [expoId, day, days],
  );
