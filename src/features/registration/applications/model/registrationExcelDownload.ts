import {
  ReportExcelScope,
  ReportRegistrationDownloadRequest,
  ReportRegistrationFilter,
  ReportRegistrationStatus,
} from '@/shared/types/registration/type';
import {
  PREREGISTER_STATUS_FILTERS,
  PreregisterFilter,
  PreregisterRow,
} from '../../common/model/preregisterLedger';

// Report 등록 원장의 선택 key·필터 전체 사전등록 행 상한(Application 사전등록 report-targets 와 같다)
export const REGISTRATION_MAX_COUNT = 10_000;

interface RegistrationExcelPlanParams {
  scope: ReportExcelScope;
  selectedRows: PreregisterRow[];
  filter: PreregisterFilter;
  /** 대장에 보이는 현재 필터 결과 행 수. 모르면 비워 둔다 */
  filterCount?: number;
}

export interface RegistrationExcelPlan {
  request: ReportRegistrationDownloadRequest | null;
  /** 요청을 보낼 수 없는 이유. 하나라도 있으면 request 는 null */
  blockers: string[];
}

/** 조건이 하나도 없는 필터 전체에만 서버가 회차 미지정 현장등록 참가자 행을 더한다 */
export const isUnfilteredRegistration = (filter: PreregisterFilter) =>
  !filter.session && !filter.status && !filter.q.trim();

/** 접수대장 필터를 Report 등록 필터로. 대장과 같은 조건을 빠짐없이 보낸다 */
export const toRegistrationFilter = (
  filter: PreregisterFilter,
): ReportRegistrationFilter => {
  const sessionId = Number(filter.session);
  const q = filter.q.trim();
  return {
    ...(filter.session !== '' && Number.isInteger(sessionId) && { sessionId }),
    ...(filter.status && {
      status: filter.status.split(',') as ReportRegistrationStatus[],
    }),
    ...(q && { q }),
  };
};

export const describeRegistrationFilter = (
  filter: PreregisterFilter,
  sessionLabel: (sessionId: number) => string,
): string[] => {
  const { sessionId, q } = toRegistrationFilter(filter);
  return [
    `회차 ${sessionId ? sessionLabel(sessionId) : '전체'}`,
    // 상태를 고르지 않은 값의 문구는 '전체 상태'라 앞의 '상태'와 겹친다
    `상태 ${filter.status ? (PREREGISTER_STATUS_FILTERS.find(({ value }) => value === filter.status)?.label ?? filter.status) : '전체'}`,
    ...(q ? [`이름·연락처 "${q}"`] : []),
  ];
};

export const buildRegistrationExcelPlan = ({
  scope,
  selectedRows,
  filter,
  filterCount,
}: RegistrationExcelPlanParams): RegistrationExcelPlan => {
  const blockers: string[] = [];

  if (scope === 'SELECTED') {
    if (selectedRows.length === 0) {
      blockers.push('다운로드할 사전등록 행을 선택해주세요.');
    }
    if (selectedRows.length > REGISTRATION_MAX_COUNT) {
      blockers.push(
        `선택 행은 최대 ${REGISTRATION_MAX_COUNT.toLocaleString('ko-KR')}건까지 보낼 수 있습니다.`,
      );
    }
    const keys = Array.from(new Set(selectedRows.map(({ id }) => id)));
    return {
      request:
        blockers.length === 0
          ? { template: 'REGISTRATION_LEDGER', scope: 'SELECTED', keys }
          : null,
      blockers,
    };
  }

  // 조건이 없으면 사전등록 행이 0건이어도 회차 미지정 현장등록 행이 있을 수 있어 서버 판정에 맡긴다
  if (filterCount === 0 && !isUnfilteredRegistration(filter)) {
    blockers.push(
      '현재 필터 결과가 0건이라 다운로드할 대상이 없습니다. 필터를 바꾸거나 행을 선택해서 받아주세요.',
    );
  }
  if (filterCount !== undefined && filterCount > REGISTRATION_MAX_COUNT) {
    blockers.push(
      `현재 필터 전체는 최대 ${REGISTRATION_MAX_COUNT.toLocaleString('ko-KR')}행까지 받을 수 있습니다. 필터를 좁혀주세요.`,
    );
  }

  const registrationFilter = toRegistrationFilter(filter);
  return {
    request:
      blockers.length === 0
        ? {
            template: 'REGISTRATION_LEDGER',
            scope: 'FILTER',
            // 빈 필터는 보내지 않는다(서버는 없는 필터를 조건 없음으로 본다)
            ...(Object.keys(registrationFilter).length > 0 && {
              registrationFilter,
            }),
          }
        : null,
    blockers,
  };
};
