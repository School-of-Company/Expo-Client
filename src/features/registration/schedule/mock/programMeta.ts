// 서버 연결 전 예시 데이터. Expo-Expo-Server#110 배포 후 API 로 교체
import { ScheduleProgram } from '../../common';

export type ProgramKind =
  | 'GENERAL'
  | 'GOLDENBELL'
  | 'TRAINING'
  | 'KEYNOTE'
  | 'ODYSSEY';

export type ProgramQrType = 'PROGRAM' | 'SESSION' | 'NONE';

export type ProgramQrColor = 'BLACK' | 'GREEN' | 'BLUE' | 'PURPLE' | 'RED';

export type DuplicatePolicy = 'LIMITED' | 'UNLIMITED';

/** 프로그램 마스터에 더해질 운영 정보. 서버 응답 필드 이름은 바뀔 수 있다 */
export interface ProgramMeta {
  /** 예: TRAIN_SAMSUNG */
  code: string;
  kind: ProgramKind;
  qrType: ProgramQrType;
  qrColor: ProgramQrColor;
  /** 1인 최대 신청 회차 */
  maxSessionsPerUser: number;
  duplicatePolicy: DuplicatePolicy;
  /** 시간이 겹치는 회차를 함께 신청하지 못하게 한다 */
  blockTimeOverlap: boolean;
  sessionCount: number;
}

const QR_COLORS: ProgramQrColor[] = ['BLACK', 'GREEN', 'BLUE', 'PURPLE', 'RED'];

/** 서버 값 대신 쓰는 예시. 같은 ID 에는 늘 같은 값을 돌려준다 */
export const getProgramMetaMock = (program: ScheduleProgram): ProgramMeta => ({
  code: `${program.programType === 'TRAINING' ? 'TRAIN' : 'PROGRAM'}_${program.id}`,
  kind: program.programType === 'TRAINING' ? 'TRAINING' : 'GENERAL',
  qrType: 'PROGRAM',
  qrColor: QR_COLORS[program.id % QR_COLORS.length],
  maxSessionsPerUser: 1,
  duplicatePolicy: 'LIMITED',
  blockTimeOverlap: true,
  sessionCount: (program.id % 3) + 1,
});
