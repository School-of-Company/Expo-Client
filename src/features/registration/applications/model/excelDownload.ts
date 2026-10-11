import {
  RegistrationProgram,
  RegistrationSession,
  ReportApplicationFilter,
  ReportApplicationStatus,
  ReportExcelDownloadRequest,
  ReportExcelScope,
  ReportExcelTemplate,
} from '@/shared/types/registration/type';
import { ApplicationRow } from '../../common';
import { ApplicationFilter, StatusFilter } from './applicationFilter';

export const SELECTED_MAX_COUNT = 1000;

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

// Application 상태는 CANCELLED 철자를 쓴다. 확정+대기는 서버 필터로 표현할 수 없다
const STATUS_TO_REPORT: Record<
  Exclude<StatusFilter, 'ACTIVE'>,
  ReportApplicationStatus | null
> = {
  CONFIRMED: 'CONFIRMED',
  WAITING: 'WAITING',
  CANCELED: 'CANCELLED',
  ALL: null,
};

interface ExcelDownloadPlanParams {
  template: ReportExcelTemplate;
  scope: ReportExcelScope;
  selectedRows: ApplicationRow[];
  filter: ApplicationFilter;
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
}

export interface ExcelDownloadPlan {
  request: ReportExcelDownloadRequest | null;
  /** 요청을 보낼 수 없는 이유. 하나라도 있으면 request 는 null */
  blockers: string[];
}

const isTraining = (program?: RegistrationProgram) =>
  program?.type === 'TRAINING';

const planSelected = (
  template: ReportExcelTemplate,
  rows: ApplicationRow[],
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

  const applicationIds = Array.from(
    new Set(rows.flatMap(({ applicationId }) => applicationId ?? [])),
  );
  if (rows.some(({ applicationId }) => !applicationId)) {
    blockers.push(
      '선택한 신청의 UUID 신청 ID가 아직 없습니다. 접수 원장 API 연결 후 사용할 수 있습니다.',
    );
  }

  if (
    template === 'TRAINEE' &&
    rows.some(({ program }) => !isTraining(program))
  ) {
    blockers.push('연수자 명단은 연수 회차 신청만 선택할 수 있습니다.');
  }

  const sessionIds = new Set(rows.map(({ sessionId }) => sessionId));
  if (template === 'PROGRAM') {
    if (sessionIds.size > 1) {
      blockers.push(
        '일반 프로그램 명단은 한 회차의 신청만 선택할 수 있습니다.',
      );
    }
    if (rows.some(({ program }) => isTraining(program))) {
      blockers.push('연수 회차는 일반 프로그램 명단으로 받을 수 없습니다.');
    }
    if (rows.some(({ status }) => status !== 'CONFIRMED')) {
      blockers.push('일반 프로그램 명단은 확정 신청만 받을 수 있습니다.');
    }
  }

  return {
    template,
    scope: 'SELECTED',
    applicationIds,
    ...(template === 'PROGRAM' && { programId: rows[0].sessionId }),
  };
};

const planFilter = (
  template: ReportExcelTemplate,
  filter: ApplicationFilter,
  programs: RegistrationProgram[],
  sessions: RegistrationSession[],
  blockers: string[],
): ReportExcelDownloadRequest | null => {
  // 서버 필터는 회차(programId)·상태·회차 제목·신청 시각만 받는다
  if (filter.keyword.trim()) {
    blockers.push(
      '검색어(이름·소속·연락처)는 서버 필터에 없어 전체 범위에 적용할 수 없습니다. 검색어를 지워주세요.',
    );
  }
  if (filter.applyType) {
    blockers.push(
      '신청구분 필터는 서버 필터에 없습니다. 신청구분을 해제해주세요.',
    );
  }
  if (filter.date) {
    blockers.push('운영일 필터는 서버 필터에 없습니다. 운영일을 해제해주세요.');
  }
  if (filter.programId && !filter.sessionId) {
    blockers.push(
      '프로그램 단위 필터는 서버 필터에 없습니다. 회차까지 선택하거나 프로그램을 해제해주세요.',
    );
  }
  if (filter.status === 'ACTIVE') {
    blockers.push(
      '확정+대기는 서버 필터에 없습니다. 상태를 하나 고르거나 전체 상태를 선택해주세요.',
    );
  }

  const session = sessions.find(({ id }) => String(id) === filter.sessionId);
  const program = programs.find(({ id }) => id === session?.programId);
  const status =
    filter.status === 'ACTIVE' ? null : STATUS_TO_REPORT[filter.status];

  if (template === 'TRAINEE' && session && !isTraining(program)) {
    blockers.push('연수자 명단은 연수 회차만 필터할 수 있습니다.');
  }
  if (template === 'PROGRAM') {
    if (!session) {
      blockers.push('일반 프로그램 명단은 회차를 하나 선택해야 합니다.');
    } else if (isTraining(program)) {
      blockers.push('연수 회차는 일반 프로그램 명단으로 받을 수 없습니다.');
    }
    if (filter.status !== 'CONFIRMED') {
      blockers.push('일반 프로그램 명단은 확정 상태만 받을 수 있습니다.');
    }
  }

  const reportFilter: ReportApplicationFilter = {
    ...(session && {
      programType: isTraining(program) ? 'TRAINING' : 'STANDARD',
      programId: session.id,
    }),
    status,
  };

  return {
    template,
    scope: 'FILTER',
    filter: reportFilter,
    ...(template === 'PROGRAM' && session && { programId: session.id }),
  };
};

export const buildExcelDownloadPlan = ({
  template,
  scope,
  selectedRows,
  filter,
  programs,
  sessions,
}: ExcelDownloadPlanParams): ExcelDownloadPlan => {
  const blockers: string[] = [];

  if (template === 'ATTENDANCE') {
    blockers.push(
      '개인 연수 출석부는 연수자 ID가 필요하지만 접수 원장에 연수자 정보가 아직 연결되지 않았습니다.',
    );
  }

  const request =
    scope === 'SELECTED'
      ? planSelected(template, selectedRows, blockers)
      : planFilter(template, filter, programs, sessions, blockers);

  return { request: blockers.length === 0 ? request : null, blockers };
};
