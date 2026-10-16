import { getExpoRoutes, getRegistrationRoutes } from '@/shared/config';

/** FormTypeModal 의 modalType. 'form' 은 만들기·수정을 모달 안에서 고른다 */
export type ExpoActionModalType = 'form';

/** 누르면 하는 일. copy 는 경로를 이 사이트 주소로 바꿔 클립보드에 복사한다 */
export type ExpoActionTarget =
  | { href: string }
  | { modal: { type: ExpoActionModalType; text: string } }
  | { copy: string };

export type ExpoActionLink = { label: string } & ExpoActionTarget;

export interface ExpoActionItem {
  key: string;
  title: string;
  description: string;
  /** 대표 동작. 상세 패널에서는 버튼으로 보인다 */
  primary: ExpoActionLink;
  /** 같은 기능에 묶인 다른 진입점 */
  more?: ExpoActionLink[];
}

export interface ExpoActionGroup {
  key: 'apply' | 'program' | 'onsite';
  title: string;
  actions: ExpoActionItem[];
}

/**
 * 박람회 상세 패널과 박람회 운영 화면이 함께 쓰는 운영 기능 그룹.
 * 뜻이 겹치던 항목은 한 페이지(프로그램, 현장 QR, 참가자·문자)나 한 모달(등록 폼)로 합쳤다
 */
export const getExpoActionGroups = (expoId: string): ExpoActionGroup[] => {
  const routes = getExpoRoutes(expoId);
  const registration = getRegistrationRoutes(expoId);

  return [
    {
      key: 'apply',
      title: '신청·폼',
      actions: [
        {
          key: 'applicationForms',
          title: '참가자 신청 화면',
          description: '참가자가 보는 신청 폼 모음 열기와 링크 공유',
          primary: { label: '신청 화면 보기', href: routes.applicationForms },
          more: [{ label: '신청 폼 링크 복사', copy: routes.applicationForms }],
        },
        {
          key: 'forms',
          title: '등록 폼',
          description: '사전·현장 등록 폼과 만족도 조사 만들기·수정',
          primary: {
            label: '등록 폼',
            modal: { type: 'form', text: '등록 폼 작업을 선택하세요.' },
          },
        },
        {
          key: 'expoEdit',
          title: '박람회 정보',
          description: '제목·기간·장소·소개와 프로그램 수정',
          primary: { label: '박람회 정보 수정', href: routes.edit },
        },
      ],
    },
    {
      key: 'program',
      title: '프로그램',
      actions: [
        {
          key: 'program',
          title: '프로그램',
          description: '프로그램 조회·출석, 회차·모집 설정, 신청 폼 관리',
          primary: { label: '프로그램', href: registration.programs },
        },
      ],
    },
    {
      key: 'onsite',
      title: '현장 운영',
      actions: [
        {
          key: 'checkIn',
          title: '박람회 입장',
          description: '입장 QR 스캔',
          primary: { label: '박람회 입장', href: routes.checkIn },
        },
        {
          key: 'qr',
          title: '현장 QR',
          description: '현장 신청용 QR 띄우기와 종이 입장 QR 발급',
          primary: { label: '현장 QR', href: routes.paperQr },
        },
        {
          key: 'participants',
          title: '참가자·문자',
          description:
            '입장자·연수자 명단 조회와 접수대장에서 문자·카카오 발송',
          primary: { label: '참가자·문자', href: registration.roster },
        },
        {
          key: 'survey',
          title: '만족도 조사',
          description: '만족도 조사 문항 만들기·수정과 응답 수 확인',
          primary: { label: '만족도 조사', href: registration.survey },
        },
        {
          key: 'lottery',
          title: '경품 추첨',
          description: '만족도 조사 경품 추첨 설정과 당첨 번호 관리',
          primary: { label: '경품 추첨', href: registration.lottery },
        },
      ],
    },
  ];
};
