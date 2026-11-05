import {
  EXPO_QR_TABS,
  getExpoRoutes,
  getRegistrationRoutes,
} from '@/shared/config';

export type ExpoAction = {
  title: string;
  description: string;
  href: string;
};

/** 박람회 상세 패널이 쓰는 운영 기능 목록 */
export const getExpoActions = (expoId: string) => {
  const routes = getExpoRoutes(expoId);
  return {
    participants: {
      title: '참가자',
      description: '선택일 입장자·행사 연수자 명단 조회',
      href: routes.participants,
    },
    formCreate: {
      title: '폼 생성',
      description: '등록용 폼·만족도 조사·프로그램 폼 만들기',
      href: routes.formNew,
    },
    programForm: {
      title: '프로그램용 폼',
      description: '프로그램 신청에 쓸 폼 만들기·다시 편집',
      href: getRegistrationRoutes(expoId).programForms,
    },
    fieldQr: {
      title: '현장 등록 QR',
      description: '현장 신청용 QR 띄우기',
      href: `${routes.qr}?tab=${EXPO_QR_TABS.access}`,
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
    programSchedule: {
      title: '프로그램 신청 설정',
      description: '프로그램 회차·묶음 추가, 신청 폼 연결, 정원·모집 기간',
      href: getRegistrationRoutes(expoId).schedule,
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
      href: getRegistrationRoutes(expoId).lottery,
    },
    edit: {
      title: '수정',
      description: '박람회 정보 수정',
      href: routes.edit,
    },
  } satisfies Record<string, ExpoAction>;
};
