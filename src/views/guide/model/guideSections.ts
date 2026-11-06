import { FC } from 'react';
import {
  CheckBoxIcon,
  MultipleChoice,
  QrCode,
  Person,
  Typing,
} from '@/shared/assets/icons';

// 문구는 초안이다(#937). 화면 이름은 실제 메뉴·버튼·탭 이름과 맞춰 둔다

export const GUIDE_TOC = [
  { id: 'exhibition-flow', title: '박람회 운영 흐름' },
  { id: 'form-types', title: '폼 종류' },
  { id: 'registration-types', title: '사전등록과 현장등록' },
  { id: 'qr-types', title: 'QR 종류별 용도' },
  { id: 'print-station', title: '명찰 출력대' },
] as const;

export type GuideSectionId = (typeof GUIDE_TOC)[number]['id'];

type IconComponent = FC<{ fill?: string; className?: string }>;

export interface FlowStep {
  title: string;
  description: string;
  // 그 일을 하는 화면 위치
  where: string;
}

export const FLOW_STEPS: FlowStep[] = [
  {
    title: '박람회 만들기',
    description:
      '제목·설명·기간·장소와 프로그램·연수 회차를 입력해 박람회를 엽니다.',
    where: '박람회 목록 › 박람회 생성',
  },
  {
    title: '폼 만들기',
    description:
      '폼 종류·대상(참가자/연수자)·등록 유형·신청 기간을 고른 뒤 질문을 작성합니다.',
    where: '박람회 상세 › 폼 생성',
  },
  {
    title: '신청 받기',
    description:
      '행사 전에는 신청 화면에서 사전등록을, 행사 당일에는 현장 등록 QR로 현장등록을 받습니다.',
    where: '신청 화면 · 현장 등록 QR',
  },
  {
    title: '현장 운영',
    description:
      '입장 QR을 스캔해 입장·퇴장을 기록하고, 명찰 출력대에서 교사·연수자 명찰을 자동으로 출력합니다.',
    where: 'QR › 박람회 입장 · 명찰 출력대',
  },
  {
    title: '마무리',
    description:
      '신청·입장 현황을 확인하고 만족도 조사 QR로 참가자 설문을 받습니다.',
    where: '참가자 관리 · 현장 등록 QR',
  },
];

export interface FormTypeCard {
  title: string;
  description: string;
  icon: IconComponent;
  meta: { label: string; value: string }[];
}

export const FORM_TYPES: FormTypeCard[] = [
  {
    title: '등록용 폼',
    description: '행사 입장을 위한 신청서입니다.',
    icon: Typing,
    meta: [
      { label: '대상', value: '참가자 · 연수자 (따로 만듦)' },
      { label: '시점', value: '사전등록 · 현장등록' },
    ],
  },
  {
    title: '만족도 조사',
    description: '행사가 끝난 뒤 받는 설문입니다.',
    icon: CheckBoxIcon,
    meta: [
      { label: '대상', value: '참가자 · 연수자' },
      { label: '참고', value: '만들어야 설문 QR을 띄울 수 있음' },
    ],
  },
  {
    title: '프로그램 폼',
    description: '프로그램·연수 회차 신청서입니다.',
    icon: MultipleChoice,
    meta: [
      { label: '대상', value: '회차 신청자' },
      { label: '참고', value: '회차마다 정원을 따로 관리' },
    ],
  },
];

export const REGISTRATION_COMPARE = {
  columns: ['사전등록', '현장등록'],
  rows: [
    { label: '언제', values: ['행사 전 신청 기간', '행사 당일'] },
    {
      label: '어떻게',
      values: ['신청 화면에서 직접 신청', '현장 등록 QR을 찍고 인증 후 등록'],
    },
    {
      label: '신청 후',
      values: [
        '입장 QR을 받아 당일 입장',
        '현장 정원이 있는 프로그램은 QR에서 바로 신청',
      ],
    },
  ],
};

export interface QrTypeCard {
  title: string;
  description: string;
  tab: string;
  who: string;
  icon: IconComponent;
}

export const QR_TYPES: QrTypeCard[] = [
  {
    title: '입장 QR',
    description:
      '등록을 마친 참가자가 받는 개인 QR입니다. 카메라나 USB 스캐너로 찍어 입장·퇴장을 기록합니다.',
    tab: '박람회 입장',
    who: '운영자가 참가자 QR을 스캔',
    icon: Person,
  },
  {
    title: '종이 QR',
    description:
      '휴대폰 없이 온 방문객에게 나눠 주는 인쇄용 QR입니다. 성인/학생 구분별로 발급해 라벨이나 A4로 인쇄하고, 잃어버린 QR은 연번으로 사용 중지합니다.',
    tab: '종이 QR 발급',
    who: '운영자가 발급·인쇄해 배부',
    icon: QrCode,
  },
  {
    title: '설문 QR',
    description:
      '대상을 만족도 조사로 고르면 설문으로 가는 QR이 뜹니다. 전체 화면으로 띄워 참가자에게 보여 줍니다.',
    tab: '현장 등록 QR',
    who: '참가자가 화면의 QR을 촬영',
    icon: CheckBoxIcon,
  },
];

export interface PrintStationStep {
  title: string;
  description: string;
  code?: string;
}

export const PRINT_STATION_STEPS: PrintStationStep[] = [
  {
    title: '출력대 화면 열기',
    description:
      '프린터가 연결된 노트북에서 박람회의 명찰 출력대를 엽니다. 주소를 바로가기로 저장하면 다음부터 같은 출력대로 열립니다.',
  },
  {
    title: '확인 창 없이 출력하도록 설정',
    description:
      'Chrome을 아래 옵션으로 실행하면 인쇄 확인 창 없이 기본 프린터로 바로 출력됩니다.',
    code: '--kiosk-printing',
  },
  {
    title: '화면을 켜 둔 채로 두기',
    description:
      '창을 최소화하거나 다른 탭으로 가리지 마세요. 브라우저가 입장 수신을 늦춥니다.',
  },
];

export const PRINT_STATION_WARNING =
  '출력대 노트북에서는 로그아웃하지 마세요. 같은 관리자 계정을 쓰는 다른 노트북도 함께 끊길 수 있습니다.';
