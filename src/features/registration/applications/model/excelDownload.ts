import {
  ReportApplicationDownloadRequest,
  ReportApplicationFilter,
  ReportExcelScope,
  ReportExcelTemplate,
} from '@/shared/types/registration/type';
import { formatDateWithWeekday } from '../../common/lib/format';
import {
  LEDGER_SORT_OPTIONS,
  LEDGER_STATUS_LABEL,
  LedgerFilter,
  LedgerRow,
  OCCUPATION_LABEL,
  parseSessionKey,
  toStatusList,
} from '../../common/model/ledger';

export const SELECTED_MAX_COUNT = 1000;

// 리포트 서버가 현재 필터 전체 다운로드를 받는 최대 건수. 넘으면 413 으로 거절한다
export const FILTER_MAX_COUNT = 10_000;

/** PERSON 은 기존 사람 명단·수기 출석부, LEDGER 는 신청 1건 = 1행 원장 */
export type ExcelTemplateGroup = 'PERSON' | 'LEDGER';

export const EXCEL_TEMPLATE_GROUP_LABEL: Record<ExcelTemplateGroup, string> = {
  LEDGER: '신청 원장',
  PERSON: '사람 명단·수기 출석부',
};

export const EXCEL_TEMPLATE_OPTIONS: {
  value: ReportExcelTemplate;
  group: ExcelTemplateGroup;
  label: string;
  description: string;
}[] = [
  {
    value: 'APPLICATION_LEDGER',
    group: 'LEDGER',
    label: '프로그램·연수 신청 원장',
    description:
      '신청 1건을 1행으로 출력합니다. 같은 사람의 취소·확정 신청이 각각 나오고 상태·상태 이력·신청일시(KST)·신청 당시 회차 운영일시를 함께 출력합니다.',
  },
  {
    value: 'STANDARD',
    group: 'PERSON',
    label: '일반 참가자 명단',
    description:
      '대상 신청의 참가자를 사람 기준으로 중복 제거해 출력합니다. 고른 상태(확정·대기·취소)를 그대로 출력합니다.',
  },
  {
    value: 'TRAINEE',
    group: 'PERSON',
    label: '연수자 명단',
    description:
      '연수 신청에 연결된 연수자를 사람 기준으로 중복 제거해 출력합니다. 고른 상태(확정·대기·취소)를 그대로 출력합니다.',
  },
  {
    value: 'PROGRAM',
    group: 'PERSON',
    label: '일반 프로그램 명단',
    description:
      '일반 프로그램 1개 회차의 확정 신청만 출력합니다. 여러 회차를 합치지 않습니다.',
  },
  {
    value: 'ATTENDANCE',
    group: 'PERSON',
    label: '개인 연수 출석부',
    description:
      '연수자 1명의 확정 연수 신청으로 만든 작성용 서식입니다. 실제 출석·이수 결과가 아닙니다.',
  },
];

interface ExcelDownloadPlanParams {
  template: ReportExcelTemplate;
  scope: ReportExcelScope;
  selectedRows: LedgerRow[];
  filter: LedgerFilter;
  /** 대장에 보이는 현재 필터 결과 건수. 모르면 비워 둔다 */
  filterCount?: number;
}

export interface ExcelDownloadPlan {
  request: ReportApplicationDownloadRequest | null;
  /** 요청을 보낼 수 없는 이유. 하나라도 있으면 request 는 null */
  blockers: string[];
}

const isConfirmed = ({ status }: LedgerRow) => status === 'CONFIRMED';
const isTraining = ({ programType }: LedgerRow) => programType === 'TRAINING';

/** 선택 신청이 모두 같은 연수자의 것이면 그 연수자 ID */
const getSingleTraineeId = (rows: LedgerRow[]) => {
  const ids = new Set(rows.map(({ traineeId }) => traineeId));
  const [only] = Array.from(ids);
  return ids.size === 1 && only !== null ? only : null;
};

const planSelected = (
  template: ReportExcelTemplate,
  rows: LedgerRow[],
  blockers: string[],
): ReportApplicationDownloadRequest | null => {
  if (rows.length === 0) {
    blockers.push('다운로드할 신청을 선택해주세요.');
    return null;
  }
  if (rows.length > SELECTED_MAX_COUNT) {
    blockers.push(
      `선택 신청은 최대 ${SELECTED_MAX_COUNT}건까지 보낼 수 있습니다.`,
    );
  }

  if (template === 'TRAINEE') {
    if (!rows.every(isTraining)) {
      blockers.push('연수자 명단은 연수 회차 신청만 선택할 수 있습니다.');
    }
    if (rows.some(({ traineeId }) => traineeId === null)) {
      blockers.push(
        '연수자가 연결되지 않은 신청은 연수자 명단에 넣을 수 없습니다.',
      );
    }
  }

  const sessions = new Set(rows.map(({ programId }) => programId));
  if (template === 'PROGRAM') {
    if (sessions.size > 1) {
      blockers.push(
        '일반 프로그램 명단은 한 회차의 신청만 선택할 수 있습니다.',
      );
    }
    if (rows.some(isTraining)) {
      blockers.push('연수 회차는 일반 프로그램 명단으로 받을 수 없습니다.');
    }
    if (!rows.every(isConfirmed)) {
      blockers.push('일반 프로그램 명단은 확정 신청만 받을 수 있습니다.');
    }
  }

  const traineeId = getSingleTraineeId(rows);
  if (template === 'ATTENDANCE') {
    if (traineeId === null) {
      blockers.push(
        '개인 연수 출석부는 연수자 1명의 신청만 선택할 수 있습니다.',
      );
    }
    if (!rows.every(isTraining)) {
      blockers.push('개인 연수 출석부는 연수 회차 신청만 선택할 수 있습니다.');
    }
    if (!rows.every(isConfirmed)) {
      blockers.push('개인 연수 출석부는 확정 신청만 받을 수 있습니다.');
    }
  }

  return {
    template,
    scope: 'SELECTED',
    applicationIds: Array.from(new Set(rows.map(({ id }) => id))),
    ...(template === 'PROGRAM' && { programId: rows[0].programId }),
    ...(template === 'ATTENDANCE' && traineeId !== null && { traineeId }),
  };
};

/** 양식이 고를 수 있는 범위. 출석부는 연수자 1명 기준이라 선택한 신청으로만 받는다 */
export const getAllowedScopes = (
  template: ReportExcelTemplate,
): ReportExcelScope[] =>
  template === 'ATTENDANCE' ? ['SELECTED'] : ['SELECTED', 'FILTER'];

export const ATTENDANCE_FILTER_BLOCKER =
  '개인 연수 출석부는 현재 필터 전체로 받을 수 없습니다. 연수자 1명의 신청을 선택해서 받아주세요.';

const planFilter = (
  template: ReportExcelTemplate,
  filter: LedgerFilter,
  filterCount: number | undefined,
  blockers: string[],
): ReportApplicationDownloadRequest | null => {
  // 필터에는 연수자 조건이 없어 다른 연수자의 신청이 섞이면 서버가 거절한다
  if (template === 'ATTENDANCE') {
    blockers.push(ATTENDANCE_FILTER_BLOCKER);
    return null;
  }

  // 대장 건수가 0건이면 서버 대상도 없다. 건수를 모르면 서버 판정에 맡긴다
  if (filterCount === 0) {
    blockers.push(
      '현재 필터 결과가 0건이라 다운로드할 대상이 없습니다. 필터를 바꾸거나 신청을 선택해서 받아주세요.',
    );
  }

  const session = parseSessionKey(filter.session);
  const status = toStatusList(filter.status);
  const search = filter.search.trim();
  const q = filter.q.trim();

  if (template === 'TRAINEE' && session?.programType === 'STANDARD') {
    blockers.push('연수자 명단은 연수 회차만 필터할 수 있습니다.');
  }
  // 연수자 명단은 서버가 연수 신청만 세므로, 회차를 연수로 고르지 않았으면 대장 건수와 달라 막지 않는다
  const isCountComparable =
    template !== 'TRAINEE' || session?.programType === 'TRAINING';
  if (
    isCountComparable &&
    filterCount !== undefined &&
    filterCount > FILTER_MAX_COUNT
  ) {
    blockers.push(
      `현재 필터 전체는 최대 ${FILTER_MAX_COUNT.toLocaleString('ko-KR')}건까지 받을 수 있습니다. 필터를 좁혀주세요.`,
    );
  }
  if (template === 'PROGRAM') {
    if (!session) {
      blockers.push('일반 프로그램 명단은 회차를 하나 선택해야 합니다.');
    } else if (session.programType !== 'STANDARD') {
      blockers.push('연수 회차는 일반 프로그램 명단으로 받을 수 없습니다.');
    }
    if (status.length !== 1 || status[0] !== 'CONFIRMED') {
      blockers.push(
        '이 양식은 확정 상태만 받을 수 있습니다. 상태를 확정으로 골라주세요.',
      );
    }
  }

  // 대장 화면의 조건을 빠짐없이 그대로 보낸다. 조건을 빼면 화면과 다른 대상이 나간다
  const reportFilter: ReportApplicationFilter = {
    ...(session ?? {}),
    // 회차를 고르지 않아도 연수자 명단은 연수 신청만 대상으로 한다
    ...(template === 'TRAINEE' && { programType: 'TRAINING' }),
    // 상태를 고르지 않으면 모든 상태(null). 생략하면 서버가 확정만 고른다
    status: status.length > 0 ? status : null,
    ...(search && { search }),
    ...(q && { q }),
    ...(filter.occupation && { occupation: filter.occupation }),
    ...(filter.eventDate && { eventDate: filter.eventDate }),
    sort: filter.sort,
  };

  return {
    template,
    scope: 'FILTER',
    filter: reportFilter,
    ...(template === 'PROGRAM' && session && { programId: session.programId }),
  };
};

/**
 * 현재 필터 전체로 보낼 조건을 사람이 읽는 문구로. 화면 조건과 다운로드 조건이 같은지 모달에서 확인한다.
 * 행사 운영일은 신청 당시 회차 운영 시작일이며 신청일이 아니다
 */
export const describeLedgerFilter = (
  filter: LedgerFilter,
  sessionLabel?: string,
): string[] => {
  const status = toStatusList(filter.status);
  const search = filter.search.trim();
  const q = filter.q.trim();
  return [
    `회차 ${filter.session ? (sessionLabel ?? filter.session) : '전체'}`,
    `상태 ${status.length > 0 ? status.map((value) => LEDGER_STATUS_LABEL[value]).join('+') : '전체(확정·대기·취소)'}`,
    ...(q ? [`이름·연락처 "${q}"`] : []),
    ...(search ? [`제출 당시 제목 "${search}"`] : []),
    ...(filter.occupation
      ? [`직업 ${OCCUPATION_LABEL[filter.occupation]}`]
      : []),
    ...(filter.eventDate
      ? [`행사 운영일(회차 시작일) ${formatDateWithWeekday(filter.eventDate)}`]
      : []),
    `정렬 ${LEDGER_SORT_OPTIONS.find(({ value }) => value === filter.sort)?.label ?? filter.sort}`,
  ];
};

export const buildExcelDownloadPlan = ({
  template,
  scope,
  selectedRows,
  filter,
  filterCount,
}: ExcelDownloadPlanParams): ExcelDownloadPlan => {
  const blockers: string[] = [];
  const request =
    scope === 'SELECTED'
      ? planSelected(template, selectedRows, blockers)
      : planFilter(template, filter, filterCount, blockers);

  return { request: blockers.length === 0 ? request : null, blockers };
};
