import { STATUS_LABEL } from '../config/labels';
import { ApplicationRow } from './buildApplicationRows';
import { formatSessionSchedule } from './format';

export const SMS_PLACEHOLDERS = [
  '{이름}',
  '{프로그램}',
  '{일시}',
  '{장소}',
  '{상태}',
] as const;

export const applySmsTemplate = (template: string, row: ApplicationRow) =>
  template
    .replaceAll('{이름}', row.name)
    .replaceAll('{프로그램}', row.program.name)
    .replaceAll('{일시}', formatSessionSchedule(row.session))
    .replaceAll('{장소}', row.session.place)
    .replaceAll('{상태}', STATUS_LABEL[row.status]);

/** 동일 연락처는 처음 나온 신청 건 기준으로 1회만 발송 */
export const dedupeByContact = (rows: ApplicationRow[]) => {
  const seen = new Set<string>();
  return rows.filter(({ contactNumber }) => {
    if (seen.has(contactNumber)) return false;
    seen.add(contactNumber);
    return true;
  });
};

const HEADER = '[AI교육원] 2026 AI 미래교육 박람회 안내';

export const SMS_TEMPLATES: { label: string; content: string }[] = [
  {
    label: '행사 전날 안내',
    content: `${HEADER}\n{이름}님, 내일 박람회에서 뵙겠습니다.\n신청하신 {프로그램} 일정은 {일시}, 장소는 {장소}입니다.`,
  },
  {
    label: '프로그램 참가 안내',
    content: `${HEADER}\n{이름}님의 {프로그램} 신청이 {상태}되었습니다.\n일시: {일시}\n장소: {장소}`,
  },
  {
    label: 'QR 준비 안내',
    content: `${HEADER}\n{이름}님, 원활한 입장을 위해 문자로 받으신 입장 QR을 미리 준비해주세요.`,
  },
  {
    label: '대기자 안내',
    content: `${HEADER}\n{이름}님은 {프로그램} 대기자로 등록되어 있습니다.\n취소자 발생 시 순서대로 확정 안내드리겠습니다.`,
  },
  {
    label: '교원연수 안내',
    content: `${HEADER}\n{이름} 선생님, 신청하신 {프로그램}은 {일시} {장소}에서 진행됩니다.\n시작 10분 전까지 입실 부탁드립니다.`,
  },
  {
    label: '주차·교통 안내',
    content: `${HEADER}\n{이름}님, 행사장 주차 공간이 협소하오니 가급적 대중교통을 이용해주세요.`,
  },
];
