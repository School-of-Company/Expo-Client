import Link from 'next/link';
import { getRegistrationRoutes } from '@/shared/config';

/**
 * 참가자 휴대전화 본인 인증과 기능 ON/OFF는 기능 설정 페이지에서만 바꾼다.
 * 수정 화면에 따로 토글을 두면 두 곳의 값이 엇갈려 보일 수 있어 그 페이지로 보낸다
 */
const FeatureSettingsNotice = ({ id }: { id: string }) => (
  <section className="flex w-full max-w-[816px] items-center justify-between gap-12 rounded-sm border-1 border-solid border-gray-200 bg-white px-[20px] py-[16px] mobile:flex-col mobile:items-start">
    <div className="flex min-w-0 flex-col gap-4">
      <h2 className="text-body1b text-black">기능·휴대전화 인증 설정</h2>
      <p className="break-keep text-caption1r text-gray-500">
        참가자 휴대전화 본인 인증과 이 박람회에서 쓸 기능은 기능 설정에서
        바꿉니다.
      </p>
    </div>
    <Link
      href={getRegistrationRoutes(id).features}
      className="shrink-0 whitespace-nowrap rounded-sm border-1 border-solid border-main-600 px-16 py-10 text-body2b text-main-600"
    >
      기능 설정으로 이동
    </Link>
  </section>
);

export default FeatureSettingsNotice;
