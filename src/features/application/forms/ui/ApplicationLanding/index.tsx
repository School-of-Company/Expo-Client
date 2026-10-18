import { Logo } from '@/shared/assets/svg';
import { ExpoDetail } from '@/shared/types/exhibition/detail/type';

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

/** "2026년 10월 31일(토)" — startedDay 는 KST 날짜 문자열이라 앞 10자리만 쓴다 */
const formatDay = (day: string) => {
  const [year, month, date] = day.slice(0, 10).split('-').map(Number);
  if (!year || !month || !date) return day;
  const weekday =
    WEEKDAY[new Date(Date.UTC(year, month - 1, date)).getUTCDay()];
  return `${year}년 ${month}월 ${date}일(${weekday})`;
};

interface Props {
  expo?: ExpoDetail;
  onApply: () => void;
  onMy: () => void;
}

const ApplicationLanding = ({ expo, onApply, onMy }: Props) => {
  const rows = expo
    ? [
        [
          '행사 기간',
          `${formatDay(expo.startedDay)} ~ ${formatDay(expo.finishedDay)}`,
        ],
        ['행사 장소', expo.location],
        ...(expo.description ? [['행사 소개', expo.description]] : []),
      ]
    : [];

  const actions = [
    {
      title: '신청하기',
      text: '사전등록, 현장등록, 프로그램 신청과 만족도 조사를 한곳에서 진행할 수 있습니다.',
      button: '신청 목록 보기',
      onClick: onApply,
      className: 'bg-main-600 text-white',
    },
    {
      title: '내 신청 확인',
      text: '휴대전화 인증 후 내가 신청한 내역과 상태를 확인할 수 있습니다.',
      button: '내 신청 보기',
      onClick: onMy,
      className: 'border-1 border-solid border-main-600 bg-white text-main-600',
    },
  ];

  return (
    <div className="flex w-full flex-1 flex-col gap-24 pb-30">
      {/* 부모 폭과 무관하게 화면 양끝까지 배경을 채운다 */}
      <header
        className="relative -mt-16 flex flex-1 flex-col items-center justify-center gap-16 overflow-visible bg-main-200 px-16 pb-[112px] pt-40 text-center shadow-[0_0_0_100vmax_#c1daff] mobile:pb-[96px]"
        style={{ clipPath: 'inset(0 -100vmax)' }}
      >
        <div
          aria-hidden
          className="absolute left-1/2 top-[56px] h-[900px] w-[1500px] -translate-x-1/2 rounded-full bg-main-100"
        />
        <Logo className="relative h-[40px] w-auto" />
        <h1 className="relative break-keep text-[2rem] font-bold leading-tight text-main-600 mobile:text-h2b">
          {expo?.title ?? '박람회'}
        </h1>
      </header>

      <section className="relative -mt-[96px] flex flex-col gap-18 rounded-md bg-white p-30 shadow-lg mobile:-mt-[80px] mobile:p-18">
        <h2 className="text-h3b text-black">박람회 참가 안내</h2>
        <ul className="flex flex-col gap-16">
          {rows.map(([label, value]) => (
            <li
              key={label}
              className="flex flex-col gap-4 border-b-1 border-solid border-gray-100 pb-16 last:border-b-0 last:pb-0"
            >
              <span className="text-caption1b text-main-600">{label}</span>
              <span className="whitespace-pre-line break-keep text-body2r text-black">
                {value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
        {actions.map(({ title, text, button, onClick, className }) => (
          <div
            key={title}
            className="flex flex-col gap-12 rounded-md border-1 border-solid border-gray-200 bg-white p-24 shadow-sm"
          >
            <h2 className="text-body1b text-black">{title}</h2>
            <p className="flex-1 break-keep text-caption1r text-gray-500">
              {text}
            </p>
            <button
              type="button"
              onClick={onClick}
              className={`mt-8 w-full rounded-sm px-24 py-14 text-body2b ${className}`}
            >
              {button}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationLanding;
