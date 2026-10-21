/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/registration/applications/model/excelDownload.check.ts`
 */
import assert from 'node:assert/strict';
import { INITIAL_LEDGER_FILTER, LedgerRow } from '../../common/model/ledger';
import {
  INITIAL_PREREGISTER_FILTER,
  PreregisterRow,
} from '../../common/model/preregisterLedger';
import { buildExcelDownloadPlan, describeLedgerFilter } from './excelDownload';
import { buildRegistrationExcelPlan } from './registrationExcelDownload';

const ledgerRow = (patch: Partial<LedgerRow>): LedgerRow => ({
  id: '22222222-2222-2222-2222-222222222222',
  receiptNumber: 1,
  participantId: 1,
  traineeId: null,
  programType: 'STANDARD',
  programId: 7,
  status: 'CONFIRMED',
  createdAt: '2026-10-01T00:00:00Z',
  title: '골든벨',
  startedAt: null,
  endedAt: null,
  name: '홍길동',
  phoneNumber: null,
  notificationPhoneNumber: null,
  occupation: 'TEACHER',
  isRepresentative: true,
  linkedTraineeId: null,
  ...patch,
});

// 취소+확정·이름·직업·운영일·정렬을 조용히 빼지 않고 그대로 보낸다
const filtered = buildExcelDownloadPlan({
  template: 'APPLICATION_LEDGER',
  scope: 'FILTER',
  selectedRows: [],
  filter: {
    ...INITIAL_LEDGER_FILTER,
    session: 'STANDARD:7',
    status: 'CONFIRMED,WAITING',
    q: ' 홍길동 ',
    occupation: 'TEACHER',
    eventDate: '2026-10-31',
    sort: 'RECEIPT_ASC',
  },
  filterCount: 3,
});
assert.deepEqual(filtered.blockers, []);
assert.deepEqual(filtered.request, {
  template: 'APPLICATION_LEDGER',
  scope: 'FILTER',
  filter: {
    programType: 'STANDARD',
    programId: 7,
    status: ['CONFIRMED', 'WAITING'],
    q: '홍길동',
    occupation: 'TEACHER',
    eventDate: '2026-10-31',
    sort: 'RECEIPT_ASC',
  },
});

// 상태를 고르지 않으면 모든 상태(null). 생략하면 서버가 확정만 고른다
const allStatus = buildExcelDownloadPlan({
  template: 'STANDARD',
  scope: 'FILTER',
  selectedRows: [],
  filter: INITIAL_LEDGER_FILTER,
  filterCount: 1,
});
assert.equal(
  allStatus.request?.scope === 'FILTER' && allStatus.request.filter.status,
  null,
);

// 일반 프로그램 명단은 여전히 확정 단일 상태만
const programMixed = buildExcelDownloadPlan({
  template: 'PROGRAM',
  scope: 'FILTER',
  selectedRows: [],
  filter: {
    ...INITIAL_LEDGER_FILTER,
    session: 'STANDARD:7',
    status: 'CONFIRMED,WAITING',
  },
  filterCount: 1,
});
assert.equal(programMixed.request, null);

// 0건·상한 초과는 요청 전에 막는다
assert.equal(
  buildExcelDownloadPlan({
    template: 'APPLICATION_LEDGER',
    scope: 'FILTER',
    selectedRows: [],
    filter: INITIAL_LEDGER_FILTER,
    filterCount: 0,
  }).request,
  null,
);
assert.equal(
  buildExcelDownloadPlan({
    template: 'APPLICATION_LEDGER',
    scope: 'FILTER',
    selectedRows: [],
    filter: INITIAL_LEDGER_FILTER,
    filterCount: 10_001,
  }).request,
  null,
);

// 선택 원장은 상태가 섞여도 신청 ID 만 보낸다
const selected = buildExcelDownloadPlan({
  template: 'APPLICATION_LEDGER',
  scope: 'SELECTED',
  selectedRows: [
    ledgerRow({}),
    ledgerRow({ id: 'a', status: 'CANCELLED', programType: 'TRAINING' }),
  ],
  filter: INITIAL_LEDGER_FILTER,
});
assert.deepEqual(selected.request, {
  template: 'APPLICATION_LEDGER',
  scope: 'SELECTED',
  applicationIds: ['22222222-2222-2222-2222-222222222222', 'a'],
});

// 행사 운영일은 신청일과 구분해 표시한다
assert.ok(
  describeLedgerFilter({ ...INITIAL_LEDGER_FILTER, eventDate: '2026-10-31' })
    .join(' · ')
    .includes('행사 운영일(회차 시작일)'),
);

const preRow = (id: string): PreregisterRow => ({
  id,
  sessionId: 3,
  status: 'CONFIRMED',
  relation: 'REPRESENTATIVE',
  applicants: 1,
  name: '홍길동',
  phoneNumber: null,
  occupation: null,
  createdAt: null,
  isReservation: false,
  representativeId: 1,
  cancelledAt: null,
  cancellationActor: null,
});

// 등록 원장은 접수대장 key 만 보내고 프로그램 신청 ID·필터를 섞지 않는다
const preSelected = buildRegistrationExcelPlan({
  scope: 'SELECTED',
  selectedRows: [
    preRow('APPLICATION:e:5'),
    preRow('RESERVATION:e:r1'),
    preRow('APPLICATION:e:5'),
  ],
  filter: { session: '3', status: 'CANCELLED', q: '홍' },
});
assert.deepEqual(preSelected.request, {
  template: 'REGISTRATION_LEDGER',
  scope: 'SELECTED',
  keys: ['APPLICATION:e:5', 'RESERVATION:e:r1'],
});

const preFiltered = buildRegistrationExcelPlan({
  scope: 'FILTER',
  selectedRows: [preRow('APPLICATION:e:5')],
  filter: { session: '3', status: 'CONFIRMED,WAITING,PENDING', q: ' 홍 ' },
  filterCount: 2,
});
assert.deepEqual(preFiltered.request, {
  template: 'REGISTRATION_LEDGER',
  scope: 'FILTER',
  registrationFilter: {
    sessionId: 3,
    status: ['CONFIRMED', 'WAITING', 'PENDING'],
    q: '홍',
  },
});

// 조건 없는 필터 전체는 사전등록 0행이어도 회차 미지정 현장등록 행이 있을 수 있어 막지 않는다
assert.deepEqual(
  buildRegistrationExcelPlan({
    scope: 'FILTER',
    selectedRows: [],
    filter: INITIAL_PREREGISTER_FILTER,
    filterCount: 0,
  }).request,
  { template: 'REGISTRATION_LEDGER', scope: 'FILTER' },
);
assert.equal(
  buildRegistrationExcelPlan({
    scope: 'FILTER',
    selectedRows: [],
    filter: { ...INITIAL_PREREGISTER_FILTER, status: 'CANCELLED' },
    filterCount: 0,
  }).request,
  null,
);
assert.equal(
  buildRegistrationExcelPlan({
    scope: 'SELECTED',
    selectedRows: [],
    filter: INITIAL_PREREGISTER_FILTER,
  }).request,
  null,
);

console.log('excelDownload.check ok');
