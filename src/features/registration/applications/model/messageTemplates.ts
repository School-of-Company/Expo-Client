/** 문자(SMS) 내용을 채우는 예시 문구. 변수는 서버가 신청별로 바꾼다 */
export interface MessageTemplate {
  label: string;
  body: string;
}

// 행사명은 고정하지 않고 선택한 박람회 제목을 쓴다. 제목이 없으면 머리말에서 뺀다
const toHeader = (expoTitle: string) => {
  const title = expoTitle.trim();
  return `${title ? `[${title}] 안내\n` : ''}{이름}님께 안내드립니다.\n\n`;
};

// {장소}는 사전등록 회차에만 값이 있어 프로그램 신청자는 발송에서 빠진다. 사전등록용 문구에만 쓴다
// 확정되지 않은 운영 약속(도착 시각·재안내 등)은 넣지 않는다. 프로그램은 퇴실 기록이 없어 출석 QR 만 안내한다
export const getMessageTemplates = (expoTitle: string): MessageTemplate[] => {
  const header = toHeader(expoTitle);
  return [
    {
      label: '행사 전날 안내',
      body: `${header}신청하신 박람회 사전등록 일정을 알려드립니다.\n- 일시: {일시}\n- 장소: {장소}\n입장 시 문자로 받은 QR 을 보여 주세요.`,
    },
    {
      label: '프로그램 참가 안내',
      body: `${header}신청하신 프로그램 참가 일정을 알려드립니다.\n- 프로그램: {프로그램}\n- 일시: {일시}\n- 신청 상태: {상태}`,
    },
    {
      label: 'QR 준비 안내',
      body: `${header}{프로그램} 출석 확인에 QR 이 필요합니다.\n문자로 받은 QR 을 미리 준비해 주세요. QR 이미지 저장이나 화면 캡처도 사용할 수 있습니다.`,
    },
    {
      label: '대기자 안내',
      body: `${header}{프로그램}({일시}) 신청이 현재 {상태} 상태입니다.\n자리가 나면 회차 정책에 따라 확정될 수 있습니다. 확정 여부는 신청 내역에서 확인해 주세요.`,
    },
    {
      label: '교원연수 안내',
      body: `${header}신청하신 교원연수 일정을 알려드립니다.\n- 연수: {프로그램}\n- 일시: {일시}\n연수 출석은 문자로 받은 QR 로 확인합니다.`,
    },
    {
      label: '주차·교통 안내',
      body: `${header}행사 당일 행사장 주변이 혼잡할 수 있습니다.\n가급적 대중교통을 이용해 주세요.`,
    },
  ];
};
