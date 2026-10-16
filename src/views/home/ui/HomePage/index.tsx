import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Check,
  Location,
  MultipleChoice,
  Museum,
  Person,
  Program,
  Typing,
} from '@/shared/assets/icons';
import heroImage from '@/shared/assets/images/home-hero.jpg';
import { Logo } from '@/shared/assets/svg';
import { COLORS, DEFAULT_EXPO_ID } from '@/shared/config';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const icon = (Icon: React.ComponentType<{ fill?: string }>) => (
  <Icon fill={COLORS.main600} />
);

const PARTICIPANT_FEATURES: Feature[] = [
  {
    icon: icon(Calendar),
    title: '사전등록·현장등록',
    description:
      '원하는 회차를 골라 신청합니다. 대표자가 함께 오는 사람까지 한 번에 신청할 수 있습니다.',
  },
  {
    icon: icon(Program),
    title: '프로그램·연수 신청',
    description:
      '박람회 안의 프로그램과 연수를 회차별로 따로 신청하고 결과를 바로 확인합니다.',
  },
  {
    icon: icon(Person),
    title: '내 신청 확인·취소',
    description:
      '휴대전화 인증으로 신청 내역과 대기 순번을 확인하고, 취소할 수 있는 신청은 직접 취소합니다.',
  },
  {
    icon: icon(Check),
    title: 'QR로 입장',
    description:
      '신청하면 받는 QR을 입구에서 보여 주면 입장이 기록됩니다. 종이 QR도 쓸 수 있습니다.',
  },
];

const OPERATOR_FEATURES: Feature[] = [
  {
    icon: icon(Museum),
    title: '박람회·신청 폼 관리',
    description:
      '박람회를 만들고 사전등록·현장등록·프로그램 신청 폼과 만족도 조사를 구성합니다.',
  },
  {
    icon: icon(MultipleChoice),
    title: '회차·정원·대기',
    description:
      '회차마다 정원과 대기 인원을 정하고, 자리가 나면 대기자가 순서대로 확정됩니다.',
  },
  {
    icon: icon(Location),
    title: '현장 입장·퇴장',
    description:
      'USB 스캐너나 카메라로 QR을 읽어 입장과 퇴장을 기록하고, 간편입장 인원도 함께 셉니다.',
  },
  {
    icon: icon(Typing),
    title: '참가 현황과 안내',
    description:
      '시간대별 입장 현황과 참가자 명단을 확인하고 엑셀로 내려받으며, 참가자에게 문자로 안내합니다.',
  },
];

const FeatureList = ({
  id,
  heading,
  features,
}: {
  id: string;
  heading: string;
  features: Feature[];
}) => (
  <section aria-labelledby={id} className="flex flex-col gap-24">
    <h2 id={id} className="text-h2b text-black mobile:text-h3b">
      {heading}
    </h2>
    <ul className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
      {features.map(({ icon, title, description }) => (
        <li
          key={title}
          className="flex gap-16 rounded-lg border-1 border-solid border-gray-100 bg-white p-24 mobile:p-20"
        >
          <span
            aria-hidden
            className="flex h-48 w-48 shrink-0 items-center justify-center rounded-md bg-main-100"
          >
            {icon}
          </span>
          <div className="flex flex-col gap-8">
            <h3 className="text-body1b text-black">{title}</h3>
            <p className="break-keep text-body2r text-gray-600">
              {description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

/**
 * 서비스 소개(루트). 특정 박람회와 묶지 않아 박람회가 끝나거나 여러 개가 쌓여도 그대로 둔다.
 * 기본 박람회(NEXT_PUBLIC_DEFAULT_EXPO_ID)를 정했을 때만 그 신청 화면으로 가는 버튼을 보여 준다
 */
const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex justify-center border-b-1 border-solid border-gray-100 px-16">
        <div className="flex h-72 w-full max-w-[1080px] items-center justify-between">
          <Logo />
          <Link
            href="/signin"
            className="flex min-h-44 items-center rounded-sm px-12 text-body2b text-gray-700"
          >
            관리자 로그인
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-16">
        <section className="flex w-full max-w-[1080px] flex-col gap-30 pb-100 pt-40 mobile:gap-24 mobile:pb-60 mobile:pt-20">
          <Image
            src={heroImage}
            alt=""
            priority
            placeholder="blur"
            sizes="(max-width: 1112px) 100vw, 1080px"
            className="h-auto w-full rounded-2xl mobile:rounded-lg"
          />
          {/* 메인 이미지에 같은 문구가 있어 PC 에서는 화면리더에만 읽히고, 이미지 글자가 작아지는 모바일에서는 보인다 */}
          <h1 className="sr-only break-keep text-h3b text-black mobile:not-sr-only">
            교원 연수 및 박람회 사전 신청, 등록 서비스
          </h1>
          <p className="max-w-[640px] break-keep text-body1r text-gray-600 mobile:text-body2r">
            참가자는 회차를 골라 신청하고 QR로 입장합니다. 운영자는 정원과 대기,
            입장 현황, 참가자 안내를 한 화면에서 처리합니다.
          </p>
          <div className="flex gap-12 mobile:flex-col">
            {DEFAULT_EXPO_ID && (
              <Link
                href="/application/forms"
                className="flex min-h-50 items-center justify-center rounded-sm bg-main-600 px-24 text-body1b text-white"
              >
                진행 중인 박람회 신청하기
              </Link>
            )}
            <Link
              href="/signin"
              className="flex min-h-50 items-center justify-center rounded-sm border-1 border-solid border-gray-200 bg-white px-24 text-body1b text-gray-700"
            >
              박람회 운영하기
            </Link>
          </div>
        </section>

        <div className="flex w-full max-w-[1080px] flex-col gap-60 pb-100 mobile:gap-48 mobile:pb-60">
          <FeatureList
            id="participant-features"
            heading="참가자"
            features={PARTICIPANT_FEATURES}
          />
          <FeatureList
            id="operator-features"
            heading="운영자"
            features={OPERATOR_FEATURES}
          />
        </div>
      </main>

      <footer className="flex justify-center border-t-1 border-solid border-gray-100 px-16">
        <p className="w-full max-w-[1080px] break-keep py-30 text-caption1r text-gray-500">
          박람회별 신청 링크는 각 행사의 안내 페이지나 문자로 받을 수 있습니다.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
