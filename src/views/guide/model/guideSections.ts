// 문구는 초안이다(#937). 화면 이름은 실제 메뉴·버튼 이름과 맞춰 둔다
export interface GuideItem {
  title: string;
  description: string;
}

export interface GuideSection {
  id: string;
  title: string;
  summary: string;
  // 순서가 있는 흐름이면 번호를 붙여 보인다
  ordered?: boolean;
  items: GuideItem[];
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'exhibition-flow',
    title: '박람회 생성 흐름',
    summary: '박람회 하나를 열어 현장에서 운영하기까지의 순서입니다.',
    ordered: true,
    items: [
      {
        title: '박람회 생성',
        description:
          '박람회 목록에서 박람회를 만들고 제목·설명·기간·장소와 프로그램·연수 회차를 입력합니다.',
      },
      {
        title: '폼 만들기',
        description:
          '박람회 상세의 폼 생성에서 폼 종류·대상(참가자/연수자)·등록 유형·신청 기간을 고른 뒤 질문을 작성합니다.',
      },
      {
        title: '신청 받기',
        description:
          '참가자는 신청 화면에서 사전등록하고, 행사 당일에는 현장 등록 QR로 현장등록합니다.',
      },
      {
        title: '현장 운영',
        description:
          'QR 화면에서 입장 QR을 스캔해 입장을 처리하고, 명찰 출력대가 입장한 교사·연수자의 명찰을 출력합니다.',
      },
      {
        title: '마무리',
        description:
          '참가자 관리에서 신청·입장 현황을 확인하고, 만족도 조사 QR로 설문을 받습니다.',
      },
    ],
  },
  {
    id: 'form-types',
    title: '폼 종류',
    summary: '폼 생성에서 고르는 세 가지 폼의 쓰임입니다.',
    items: [
      {
        title: '등록용 폼',
        description:
          '행사 입장을 위한 사전·현장등록 신청서입니다. 참가자용과 연수자용을 따로 만듭니다.',
      },
      {
        title: '만족도 조사',
        description:
          '행사가 끝난 뒤 참가자·연수자에게 받는 설문입니다. 만들어 두어야 만족도 조사 QR을 띄울 수 있습니다.',
      },
      {
        title: '프로그램 폼',
        description:
          '박람회 안의 프로그램·연수 회차에 신청할 때 쓰는 신청서입니다.',
      },
    ],
  },
  {
    id: 'registration-types',
    title: '사전등록과 현장등록',
    summary: '같은 대상이라도 언제 신청하느냐에 따라 등록 유형이 나뉩니다.',
    items: [
      {
        title: '사전등록',
        description:
          '행사 전에 신청 기간 동안 신청 화면에서 미리 등록합니다. 신청을 마치면 입장 QR을 받습니다.',
      },
      {
        title: '현장등록',
        description:
          '행사 당일 현장 등록 QR을 찍고 인증을 거쳐 등록합니다. 현장 정원이 있는 프로그램은 QR에서 바로 신청할 수 있습니다.',
      },
    ],
  },
  {
    id: 'qr-types',
    title: 'QR 종류별 용도',
    summary:
      '박람회 상세의 QR 화면에서 박람회 입장·종이 QR 발급·현장 등록 QR 탭으로 나뉩니다.',
    items: [
      {
        title: '입장 QR',
        description:
          '등록을 마친 참가자가 받는 개인 QR입니다. 박람회 입장 탭에서 카메라나 USB 스캐너로 찍어 입장·퇴장을 기록합니다.',
      },
      {
        title: '종이 QR',
        description:
          '휴대폰 없이 온 방문객에게 나눠 주는 인쇄용 QR입니다. 성인/학생 구분별 장수를 발급해 라벨이나 A4로 인쇄하고, 잃어버린 QR은 연번으로 사용 중지합니다.',
      },
      {
        title: '설문 QR',
        description:
          '현장 등록 QR 탭에서 대상을 만족도 조사로 고르면 설문으로 가는 QR을 띄웁니다. 전체 화면으로 띄워 참가자에게 보여 줄 수 있습니다.',
      },
    ],
  },
  {
    id: 'print-station',
    title: '명찰 출력대 사용법',
    summary:
      '프린터가 연결된 노트북에서 입장한 교사·연수자의 명찰을 자동으로 출력합니다.',
    ordered: true,
    items: [
      {
        title: '출력대 열기',
        description:
          '프린터가 연결된 노트북에서 박람회의 명찰 출력대 화면을 엽니다. 주소를 바로가기로 저장하면 다음부터 같은 출력대로 열립니다.',
      },
      {
        title: '확인 창 없이 출력',
        description:
          'Chrome을 --kiosk-printing 옵션으로 실행하면 인쇄 확인 창 없이 기본 프린터로 바로 출력됩니다.',
      },
      {
        title: '화면 켜 두기',
        description:
          '출력대 화면을 켜 둔 채로 두고 창을 최소화하거나 다른 탭으로 가리지 마세요. 브라우저가 입장 수신을 늦춥니다.',
      },
      {
        title: '로그아웃 주의',
        description:
          '출력대 노트북에서 로그아웃하면 같은 관리자 계정을 쓰는 다른 노트북도 함께 끊길 수 있습니다.',
      },
    ],
  },
];
