const STEPS = ['박람회 정보', '폼 설정'] as const;

/** 박람회 생성 두 단계 중 지금 어디인지 보여 준다 */
const CreateSteps = ({ current }: { current: 1 | 2 }) => (
  <ol
    aria-label="박람회 생성 단계"
    className="flex w-full max-w-[816px] items-center gap-12"
  >
    {STEPS.map((label, index) => {
      const step = index + 1;
      const isCurrent = step === current;
      const isDone = step < current;
      return (
        <li
          key={label}
          aria-current={isCurrent ? 'step' : undefined}
          className="flex flex-1 items-center gap-8"
        >
          <span
            className={`flex h-24 w-24 flex-none items-center justify-center rounded-full text-caption1b ${
              isCurrent || isDone
                ? 'bg-main-600 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {isDone ? '✓' : step}
          </span>
          <span
            className={`text-body2b ${isCurrent ? 'text-black' : 'text-gray-400'}`}
          >
            {label}
          </span>
          {step < STEPS.length && (
            <span className="h-px flex-1 bg-gray-200" aria-hidden />
          )}
        </li>
      );
    })}
  </ol>
);

export default CreateSteps;
