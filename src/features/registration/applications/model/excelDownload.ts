import {
  ReportApplicationFilter,
  ReportExcelDownloadRequest,
  ReportExcelScope,
  ReportExcelTemplate,
} from '@/shared/types/registration/type';
import {
  ACTIVE_STATUS_FILTER,
  LedgerFilter,
  LedgerRow,
  parseSessionKey,
} from '../../common/model/ledger';

export const SELECTED_MAX_COUNT = 1000;

// 리포트 서버 ApplicationFilter.search 길이 상한(1~200자)
const REPORT_SEARCH_MAX_LENGTH = 200;

// 리포트 서버가 현재 필터 전체 다운로드를 받는 최대 건수. 넘으면 413 으로 거절한다
export const FILTER_MAX_COUNT = 10_000;

export const EXCEL_TEMPLATE_OPTIONS: {
  value: ReportExcelTemplate;
  label: string;
  description: string;
}[] = [
  {
    value: 'STANDARD',
    label: '일반 참가자 명단',
    description:
      '대상 신청의 참가자를 사람 기준으로 중복 제거해 출력합니다. 고른 상태(확정·대기·취소)를 그대로 출력합니다.',
  },
  {
    value: 'TRAINEE',
    label: '연수자 명단',
    description:
      '연수 신청에 연결된 연수자를 사람 기준으로 중복 제거해 출력합니다. 고른 상태(확정·대기·취소)를 그대로 출력합니다.',
  },
  {
    value: 'PROGRAM',
    label: '일반 프로그램 명단',
    description:
      '일반 프로그램 1개 회차의 확정 신청만 출력합니다. 여러 회차를 합치지 않습니다.',
  },
  {
    value: 'ATTENDANCE',
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
  request: ReportExcelDownloadRequest | null;
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
): ReportExcelDownloadRequest | null => {
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
): ReportExcelDownloadRequest | null => {
  // 필터에는 연수자 조건이 없어 다른 연수자의 신청이 섞이면 서버가 거절한다
  if (template === 'ATTENDANCE') {
    blockers.push(ATTENDANCE_FILTER_BLOCKER);
    return null;
  }

  // 현재 필터 결과가 0건이면 요청 전에 막는다. 실제 성공 여부는 서버가 최종 판정한다
  if (filterCount === 0) {
    blockers.push(
      '현재 필터에 해당하는 신청이 없어 다운로드할 대상이 없습니다. 필터를 바꾸거나 신청을 선택해주세요.',
    );
  }

  // Report 필터에는 참가자 이름·번호와 직업 조건이 없다. 조용히 빼면 화면과 다른 대상이 나간다
  const search = filter.search.trim();
  if (search.length > REPORT_SEARCH_MAX_LENGTH) {
    blockers.push(
      `제목 검색은 다운로드 필터에서 최대 ${REPORT_SEARCH_MAX_LENGTH}자까지 받을 수 있습니다.`,
    );
  }
  if (filter.q.trim()) {
    blockers.push(
      '이름·번호 검색은 다운로드 필터에 없습니다. 검색어를 지우거나 신청을 선택해서 받아주세요.',
    );
  }
  if (filter.occupation) {
    blockers.push(
      '직업 조건은 다운로드 필터에 없습니다. 직업을 해제하거나 신청을 선택해서 받아주세요.',
    );
  }

  if (filter.eventDate) {
    blockers.push(
      '행사일 조건은 다운로드 필터에 없습니다. 행사일을 해제하거나 신청을 선택해서 받아주세요.',
    );
  }
  if (filter.status === ACTIVE_STATUS_FILTER) {
    blockers.push(
      '확정+대기는 다운로드 필터에서 한 번에 고를 수 없습니다. 상태를 하나만 고르거나 신청을 선택해서 받아주세요.',
    );
  }

  const session = parseSessionKey(filter.session);
  const status =
    filter.status && filter.status !== ACTIVE_STATUS_FILTER
      ? filter.status
      : null;

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
    if (status !== 'CONFIRMED') {
      blockers.push(
        '이 양식은 확정 상태만 받을 수 있습니다. 상태를 확정으로 골라주세요.',
      );
    }
  }

  const reportFilter: ReportApplicationFilter = {
    ...(session ?? {}),
    // 회차를 고르지 않아도 연수자 명단은 연수 신청만 대상으로 한다
    ...(template === 'TRAINEE' && { programType: 'TRAINING' }),
    status,
    ...(search && { search }),
    // Report 는 신청일시 정렬만 받는다. 다른 정렬은 대상이 같고 순서만 달라 서버 기본값에 맡긴다
    ...((filter.sort === 'CREATED_ASC' || filter.sort === 'CREATED_DESC') && {
      sort: filter.sort,
    }),
  };

  return {
    template,
    scope: 'FILTER',
    filter: reportFilter,
    ...(template === 'PROGRAM' && session && { programId: session.programId }),
  };
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
