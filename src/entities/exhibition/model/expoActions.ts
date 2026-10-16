import { getExpoRoutes, getRegistrationRoutes } from '@/shared/config';

/** FormTypeModal 의 modalType */
export type ExpoActionModalType = 'formcreate' | 'FIELD' | 'edit';

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
 * 뜻이 겹치던 항목은 하나로 묶고, 묶인 기능은 more 로 남겨 진입점이 사라지지 않게 한다
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
            label: '폼 만들기',
            modal: { type: 'formcreate', text: '생성할 항목을 선택하세요.' },
          },
          more: [
            {
              label: '폼 수정',
              modal: { type: 'edit', text: '수정할 항목을 선택하세요.' },
            },
          ],
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
          primary: { label: '프로그램 조회·출석', href: routes.program },
          more: [
            { label: '회차·모집 설정', href: registration.schedule },
            { label: '프로그램 신청 폼', href: registration.programForms },
          ],
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
          primary: {
            label: '현장 등록 QR',
            modal: { type: 'FIELD', text: '대상을 선택하세요.' },
          },
          more: [{ label: '종이 QR 발급', href: routes.paperQr }],
        },
        {
          key: 'participants',
          title: '참가자',
          description: '입장자·연수자 명단 조회와 문자·카카오 발송',
          primary: { label: '참가자 조회', href: routes.participants },
          // 단체 발송은 접수 목록의 그룹 발송 모달이 맡는다
          more: [{ label: '문자 전송', href: registration.applications }],
        },
        {
          key: 'lottery',
          title: '경품 추첨',
          description: '만족도 조사 경품 추첨 설정과 당첨 번호 관리',
          primary: { label: '경품 추첨', href: routes.lottery },
        },
      ],
    },
  ];
};
