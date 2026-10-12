import { getExpoRoutes, getRegistrationRoutes } from '@/shared/config';

/** FormTypeModal 의 modalType */
export type ExpoActionModalType = 'formcreate' | 'FIELD' | 'edit';

export type ExpoAction = {
  title: string;
  description: string;
} & ({ href: string } | { modal: { type: ExpoActionModalType; text: string } });

/** 박람회 상세 패널과 박람회 운영 페이지가 함께 쓰는 운영 기능 목록 */
export const getExpoActions = (expoId: string) => {
  const routes = getExpoRoutes(expoId);
  return {
    participants: {
      title: '조회',
      description: '사전등록·연수 참가자 명단 조회',
      href: routes.participants,
    },
    formCreate: {
      title: '폼 생성',
      description: '신청 폼·만족도 조사 폼 만들기',
      modal: { type: 'formcreate', text: '생성할 항목을 선택하세요.' },
    },
    fieldQr: {
      title: '현장 등록 QR',
      description: '현장 신청용 QR 띄우기',
      modal: { type: 'FIELD', text: '대상을 선택하세요.' },
    },
    checkIn: {
      title: '박람회 입장',
      description: '입장 QR 스캔',
      href: routes.checkIn,
    },
    program: {
      title: '프로그램',
      description: '일반·연수 프로그램 조회와 출석',
      href: routes.program,
    },
    message: {
      title: '문자 전송',
      description: '접수 목록에서 대상을 골라 문자·카카오 보내기',
      // 단체 발송은 접수 목록의 그룹 발송 모달이 맡는다
      href: getRegistrationRoutes(expoId).applications,
    },
    paperQr: {
      title: '종이 QR 발급',
      description: '현장 배포용 종이 입장 QR 발급',
      href: routes.paperQr,
    },
    lottery: {
      title: '경품 추첨',
      description: '만족도 조사 경품 추첨 설정과 당첨 번호 관리',
      href: routes.lottery,
    },
    edit: {
      title: '수정',
      description: '박람회 정보·폼 수정',
      modal: { type: 'edit', text: '수정할 항목을 선택하세요.' },
    },
  } satisfies Record<string, ExpoAction>;
};
