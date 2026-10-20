import { NO_ANSWER, toAnswerDisplay } from '../../lib/answerDisplay';

/** 접수 당시 문항·답변을 읽기 전용으로 보여 준다. 사용자·관리자 화면 공용 */
const AnswerList = ({
  questions,
  answers,
  currentInfo = false,
  hideEmpty = false,
}: {
  questions: unknown;
  answers: unknown;
  /** 접수 당시가 아닌 현재 등록 정보. 문항 스냅샷이 없으므로 키를 그대로 라벨로 쓴다 */
  currentInfo?: boolean;
  /** 답변 없음 항목을 숨긴다 */
  hideEmpty?: boolean;
}) => {
  const display = toAnswerDisplay(questions, answers);
  const { snapshotMissing } = display;
  const rows = hideEmpty
    ? display.rows.filter((row) => row.text !== NO_ANSWER)
    : display.rows;

  return (
    <div className="flex flex-col gap-8">
      {snapshotMissing && !currentInfo && (
        <p className="text-caption1r text-gray-500">
          접수 당시 문항 정보가 저장되어 있지 않아 문항 번호로 표시합니다.
        </p>
      )}
      {rows.length === 0 ? (
        <p className="text-body2r text-gray-400">답변이 없습니다.</p>
      ) : (
        <dl className="flex flex-col gap-8">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex gap-16 mobile:flex-col mobile:gap-4"
            >
              <dt className="w-[120px] flex-none break-keep text-body2r text-gray-500">
                {currentInfo ? row.id : row.label}
              </dt>
              <dd className="min-w-0 whitespace-pre-line break-all text-body2r text-black">
                {row.text}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

export default AnswerList;
