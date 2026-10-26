import { Logo } from '@/shared/assets/svg';
import { PublicExpoDetail } from '../../model/useParticipantExpoDetail';

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

/** startedDay 는 KST 날짜 문자열이라 앞 10자리만 쓴다 */
const parseDay = (day: string) => {
  const [year, month, date] = day.slice(0, 10).split('-').map(Number);
  if (!year || !month || !date) return null;
  const weekday =
    WEEKDAY[new Date(Date.UTC(year, month - 1, date)).getUTCDay()];
  return { year, month, date, weekday };
};

/** "2026.10.31.(토) ~ 11.1.(일)" — 끝나는 해가 같으면 연도를 생략한다 */
const formatPeriod = (startedDay: string, finishedDay: string) => {
  const start = parseDay(startedDay);
  const end = parseDay(finishedDay);
  if (!start || !end) return `${startedDay} ~ ${finishedDay}`;
  const endText =
    start.year === end.year
      ? `${end.month}.${end.date}.(${end.weekday})`
      : `${end.year}.${end.month}.${end.date}.(${end.weekday})`;
  return `${start.year}.${start.month}.${start.date}.(${start.weekday}) ~ ${endText}`;
};

interface Props {
  expo?: PublicExpoDetail;
  /** 행사가 시작돼 사전등록 대신 현장등록을 받는 중 */
  isFieldReleased?: boolean;
  onApply: () => void;
  onMy: () => void;
}

const ApplicationLanding = ({
  expo,
  isFieldReleased = false,
  onApply,
  onMy,
}: Props) => {
  const rows = expo
    ? [
        ['행사 기간', formatPeriod(expo.startedDay, expo.finishedDay)],
        ['행사 장소', expo.location],
        ...(expo.description ? [['행사 소개', expo.description]] : []),
      ]
    : [];

  const actions = [
    {
      title: '신청하기',
      text: isFieldReleased
        ? '현장등록·프로그램·교원연수 회차와 신청 기간을 확인하고, 접수 중인 항목을 바로 신청할 수 있습니다.'
        : '먼저 사전등록을 하고, 확정된 뒤에 프로그램·교원연수를 신청합니다. 회차와 신청 기간을 확인하고 접수 중인 항목을 신청할 수 있습니다.',
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
    <div className="flex w-full flex-1 flex-col justify-center gap-24 pb-30">
      {/* 부모 폭과 무관하게 화면 양끝까지 배경을 채운다 */}
      <header
        className="relative flex flex-col items-center gap-16 overflow-visible bg-main-200 px-16 pb-[112px] pt-40 text-center shadow-[0_0_0_100vmax_#c1daff] mobile:pb-[96px]"
        style={{ clipPath: 'inset(-100vmax -100vmax 0)' }}
      >
        <div
          aria-hidden
          className="absolute bottom-0 left-1/2 top-[-32px] w-[1100px] -translate-x-1/2 rounded-t-[600px] bg-main-100"
        />
        <Logo className="relative h-[40px] w-auto" />
        <h1 className="relative break-keep text-[2rem] font-bold leading-tight text-main-600 mobile:text-h2b">
          {expo?.title ?? '박람회'} 사전등록
        </h1>
      </header>

      {/* 박람회 정보를 못 받으면 안내 없이 신청·내 신청 진입만 보인다 */}
      {rows.length > 0 && (
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
      )}

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
