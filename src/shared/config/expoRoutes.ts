// 경로 파라미터(expoId)는 URL에서 온 값이라 그대로 붙이면 `../` 로 다른 경로를 만들 수 있다. 항상 인코딩한다
const segment = (expoId: string) => encodeURIComponent(expoId);

// Gateway 공개 경로의 {expoId} 와 같은 규칙: 숫자 또는 UUID
const EXPO_ID_PATTERN =
  /^(?:[0-9]+|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const isValidExpoId = (expoId: string) => EXPO_ID_PATTERN.test(expoId);

// 종이 QR 발급처럼 소문자 UUID만 받는 API용. 대문자는 소문자로 맞추고, UUID가 아니면 null
export const toLowercaseUuid = (expoId: string) => {
  const id = expoId.toLowerCase();
  return UUID_PATTERN.test(id) ? id : null;
};

/**
 * 화면 경로의 박람회 ID 를 서버에 보낼 형태로 맞춘다. UUID 는 소문자로 맞추고(서버 비교가 대소문자를 가림),
 * 숫자 ID 는 관리 화면처럼 그대로 통과시킨다. 둘 다 아니면 null
 */
export const normalizeExpoId = (expoId: string) =>
  toLowercaseUuid(expoId) ?? (isValidExpoId(expoId) ? expoId : null);

// QR 화면(현장 등록 QR·박람회 입장·종이 QR 발급)의 탭. 주소의 tab 값이다
export const EXPO_QR_TABS = {
  access: 'access',
  checkIn: 'check-in',
  paper: 'paper',
} as const;

export type ExpoQrTab = (typeof EXPO_QR_TABS)[keyof typeof EXPO_QR_TABS];

export const getExpoRoutes = (expoId: string) => {
  const id = segment(expoId);
  const qr = `/admin/exhibition/qr/${id}`;
  return {
    participants: `/admin/exhibition/participants/${id}?page=1&userType=STANDARD`,
    edit: `/admin/exhibition/edit/${id}`,
    qr,
    // 예전 폼 유형 조합을 QR 대상으로 옮긴다. 일반 사전등록 QR 은 없어져 대상 없이 연다
    accessQr: (userType: string, applicationType: string) => {
      const target =
        userType === 'TRAINEE'
          ? 'trainee'
          : applicationType === 'FIELD'
            ? 'field'
            : undefined;
      return `${qr}?tab=${EXPO_QR_TABS.access}${target ? `&target=${target}` : ''}`;
    },
    checkIn: `${qr}?tab=${EXPO_QR_TABS.checkIn}`,
    program: `/admin/program/${id}?navigation=standard`,
    // 회차 참가자·QR 출석 화면. 연수와 일반 프로그램 ID 는 겹칠 수 있어 종류를 함께 넘긴다
    programDetail: (programId: number, type: 'STANDARD' | 'TRAINING') =>
      `/admin/program/${id}/detail/${programId}?navigation=${type === 'TRAINING' ? 'training' : 'standard'}`,
    paperQr: `${qr}?tab=${EXPO_QR_TABS.paper}`,
    // 프린터가 연결된 노트북에서 여는 명찰 자동 출력 화면(#924)
    printStation: `/admin/exhibition/print-station/${id}`,
    // 참가자가 보는 신청 폼 모음
    applicationForms: `/application/forms/${id}`,
    // 사전등록·프로그램 회차를 보는 신청 목록 탭. 프로그램 신청 화면의 뒤로 가기가 쓴다
    applicationList: `/application/forms/${id}?view=list`,
    // 사전등록·프로그램·교원연수 중 보던 신청 목록 탭으로 돌아간다
    applicationListTab: (tab: 'registration' | 'program' | 'training') =>
      `/application/forms/${id}?view=list&tab=${tab}`,
    // 신청 화면은 박람회 안내부터 보여 주므로 내 신청 탭을 주소로 지정한다
    applicationMy: `/application/forms/${id}?view=my`,
    applicationProgram: `/application/forms/${id}/program`,
    applicationTraining: `/application/forms/${id}/training`,
  };
};

export const getRegistrationRoutes = (expoId: string) => {
  const base = `/admin/registration/${segment(expoId)}`;
  return {
    dashboard: base,
    applications: `${base}/applications`,
    schedule: `${base}/schedule`,
    history: `${base}/history`,
    attendance: `${base}/attendance`,
    participants: `${base}/participants`,
    // 등록용 폼·만족도 조사·프로그램용 폼은 신청관리의 폼 탭에서 관리한다
    forms: `${base}/schedule?view=forms`,
    programForms: `${base}/schedule?view=forms`,
    programFormNew: `${base}/program-forms/new`,
    programForm: (formId: string) =>
      `${base}/program-forms/${encodeURIComponent(formId)}`,
    survey: `${base}/survey`,
    lottery: `${base}/survey?view=lottery`,
  };
};

/**
 * 등록용 폼·만족도 조사를 만들거나 고치거나 지운 뒤 돌아갈 곳.
 * 신청관리 폼 탭에서 왔으면(`?returnTo=schedule`) 그 탭으로, 아니면 박람회 상세로 돌아간다
 */
export const getFormReturnPath = (expoId: string) => {
  const returnTo =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('returnTo');
  return returnTo === 'schedule'
    ? getRegistrationRoutes(expoId).forms
    : `/admin/exhibition/detail/${segment(expoId)}`;
};
