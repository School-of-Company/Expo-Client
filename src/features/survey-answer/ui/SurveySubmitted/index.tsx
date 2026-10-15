import { ReactNode } from 'react';
import { ApplicationSuccessLogo } from '@/shared/assets/svg';

/** 설문 제출 뒤 보여 주는 접수 완료 화면. 경품 당첨 안내 같은 추가 내용은 children으로 받는다. */
const SurveySubmitted = ({ children }: { children?: ReactNode }) => (
  <div className="flex w-full max-w-[816px] flex-1 flex-col items-center justify-center gap-32">
    <ApplicationSuccessLogo className="mobile:h-[160px] mobile:w-[160px]" />
    <p className="text-center text-h1m text-main-600 mobile:text-body1b">
      만족도 조사 응답이 접수되었습니다.
    </p>
    {children}
  </div>
);

export default SurveySubmitted;
