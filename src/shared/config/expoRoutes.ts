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

export const getExpoRoutes = (expoId: string) => {
  const id = segment(expoId);
  return {
    checkIn: `/exhibition/check-in/${id}`,
    paperQr: `/exhibition/paper-qr/${id}`,
    // 현장 신청용 QR 을 화면에 띄운다. 연수자는 사전 등록만 있다
    accessQr: (
      userType: 'STANDARD' | 'TRAINEE',
      applicationType: 'PRE' | 'FIELD',
    ) =>
      `/exhibition/access-qr/${id}?userType=${userType}&applicationType=${applicationType}`,
    lottery: `/exhibition/lottery/${id}`,
    edit: `/exhibition/edit/${id}`,
    // 참가자가 보는 신청 폼 모음
    applicationForms: `/application/forms/${id}`,
  };
};

export const getRegistrationRoutes = (expoId: string) => {
  const base = `/admin/registration/${segment(expoId)}`;
  return {
    dashboard: base,
    applications: `${base}/applications`,
    // 접수대장과 같은 페이지의 입장자·연수자 명단 탭
    roster: `${base}/applications/roster`,
    // 프로그램 조회·출석, 회차·모집, 프로그램 신청 폼을 탭으로 묶은 페이지
    programs: `${base}/programs`,
    schedule: `${base}/programs/schedule`,
    history: `${base}/history`,
    attendance: `${base}/attendance`,
    participants: `${base}/participants`,
    operations: `${base}/operations`,
    programForms: `${base}/programs/forms`,
    programFormNew: `${base}/programs/forms/new`,
    programForm: (formId: string) =>
      `${base}/programs/forms/${encodeURIComponent(formId)}`,
    survey: `${base}/survey`,
  };
};
