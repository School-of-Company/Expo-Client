import Link from 'next/link';

/**
 * 행사 기간의 만족도 조사 안내. 참가자 역할·인증과 무관하게 설문 QR 과 같은 공개 설문 페이지로 보낸다.
 * 설문 조회가 실패하면 공개로 단정하지 않고 다시 시도를 보여 준다
 */
const SurveyGuide = ({
  expoId,
  isError,
  onRetry,
}: {
  expoId: string;
  isError: boolean;
  onRetry: () => void;
}) =>
  isError ? (
    <div className="flex flex-col gap-12">
      <p role="alert" className="break-keep text-body2r text-error">
        만족도 조사 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="w-full rounded-sm border-1 border-solid border-main-600 px-24 py-14 text-body2b text-main-600"
      >
        다시 시도
      </button>
    </div>
  ) : (
    <div className="flex flex-col gap-16 rounded-sm border-1 border-solid border-gray-200 bg-white p-24 mobile:p-16">
      <p className="break-keep text-body1b text-black mobile:text-body2b">
        박람회는 어떠셨나요?
      </p>
      <p className="break-keep text-body2r text-gray-600">
        참여해 주셔서 감사합니다. 더 나은 박람회를 위해 만족도 조사에 의견을
        남겨 주세요. 로그인이나 별도 인증 없이 참여할 수 있습니다.
      </p>
      <Link
        href={`/survey/${expoId}`}
        className="rounded-sm bg-main-600 px-24 py-14 text-center text-body2b text-white"
      >
        만족도 조사 참여하러 가기
      </Link>
    </div>
  );

export default SurveyGuide;
