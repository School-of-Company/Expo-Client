import {
  APPLY_TYPE_LABEL,
  PARTICIPANT_TYPE_LABEL,
  STATUS_LABEL,
} from '../config/labels';
import { ApplicationRow } from './buildApplicationRows';

const HEADERS = [
  '접수번호',
  '이름',
  '연락처',
  '인증 번호',
  '지역',
  '소속',
  '유형',
  '학년',
  '프로그램',
  '회차',
  '운영일',
  '시작',
  '종료',
  '장소',
  '신청구분',
  '상태',
  '신청일시',
];

// 엑셀에서 한글이 깨지지 않도록 BOM 추가
const BOM = String.fromCharCode(0xfeff);

// 엑셀이 수식으로 실행하지 않도록 =, +, -, @, 탭, CR 로 시작하는 값 앞에 ' 를 붙인다 (CSV injection 방지)
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

const escapeCsv = (value: string | number) => {
  const raw = String(value);
  const text = FORMULA_PREFIX.test(raw) ? `'${raw}` : raw;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const exportApplicationsCsv = (rows: ApplicationRow[]) => {
  const lines = rows.map((row) =>
    [
      row.id,
      row.name,
      row.phoneNumber,
      row.verifiedPhoneNumber,
      row.region,
      row.affiliation,
      PARTICIPANT_TYPE_LABEL[row.participantType],
      row.grade ?? '',
      row.program.name,
      row.session.name,
      row.session.date,
      row.session.startTime,
      row.session.endTime,
      row.session.place,
      APPLY_TYPE_LABEL[row.applyType],
      STATUS_LABEL[row.status],
      new Date(row.createdAt).toLocaleString('ko-KR'),
    ]
      .map(escapeCsv)
      .join(','),
  );

  const csv = `${BOM}${[HEADERS.join(','), ...lines].join('\n')}`;
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `접수대장_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
