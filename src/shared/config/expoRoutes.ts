// 경로 파라미터(expoId)는 URL에서 온 값이라 그대로 붙이면 `../` 로 다른 경로를 만들 수 있다. 항상 인코딩한다
const segment = (expoId: string) => encodeURIComponent(expoId);

// Gateway 공개 경로의 {expoId} 와 같은 규칙: 숫자 또는 UUID
const EXPO_ID_PATTERN =
  /^(?:[0-9]+|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

export const isValidExpoId = (expoId: string) => EXPO_ID_PATTERN.test(expoId);

export const getExpoRoutes = (expoId: string) => {
  const id = segment(expoId);
  return {
    participants: `/exhibition/participants/${id}?page=1&userType=STANDARD`,
    checkIn: `/exhibition/check-in/${id}`,
    program: `/program/${id}?navigation=standard`,
    paperQr: `/exhibition/paper-qr/${id}`,
    lottery: `/exhibition/lottery/${id}`,
  };
};

export const getRegistrationRoutes = (expoId: string) => {
  const base = `/admin/future-edu-expo/${segment(expoId)}`;
  return {
    dashboard: base,
    applications: `${base}/applications`,
    schedule: `${base}/schedule`,
    history: `${base}/history`,
    operations: `${base}/operations`,
  };
};
