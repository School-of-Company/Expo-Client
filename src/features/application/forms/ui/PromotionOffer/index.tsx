import { PromotionOffer as Offer } from '../../api/myApplications';

const TYPE_LABEL: Record<Offer['type'], string> = {
  PREREGISTER: '사전등록',
  STANDARD: '프로그램',
  TRAINING: '연수',
};

/**
 * 대기에서 올라온 참여 제안. 수락 버튼은 서버 respondable 만 따르며 기한 카운트다운으로 막거나 열지 않는다.
 * 기한(expiresAt)은 서버 값을 그대로 보여 주기만 한다.
 */
const PromotionOffer = ({
  offer,
  onAccept,
  onDecline,
  isResponding,
}: {
  offer: Offer;
  onAccept: () => void;
  onDecline: () => void;
  isResponding: boolean;
}) => {
  const { type, seats, status, respondable, expiresAt } = offer;

  return (
    <div className="flex items-center justify-between gap-12 rounded-sm border-1 border-solid border-main-600 bg-white px-18 py-18 mobile:flex-col mobile:items-stretch">
      <div className="flex flex-col gap-6">
        <p className="break-keep text-body2b text-black">
          {TYPE_LABEL[type]} 참여 제안 · {seats.toLocaleString()}석
        </p>
        <p className="break-keep text-caption1r text-gray-500">
          {status === 'PENDING'
            ? '자리가 나서 안내 문자를 보내고 있습니다. 발송이 끝나면 이곳에서 수락할 수 있습니다.'
            : '자리가 났습니다. 기한 안에 수락하면 확정되고, 거절하거나 기한이 지나면 대기가 종료됩니다.'}
          {expiresAt &&
            ` 응답 기한: ${new Date(expiresAt).toLocaleString('ko-KR')}`}
        </p>
      </div>

      {respondable && (
        <div className="flex items-center gap-8 mobile:[&>button]:flex-1">
          <button
            type="button"
            disabled={isResponding}
            onClick={onAccept}
            className="whitespace-nowrap rounded-sm bg-main-600 px-16 py-8 text-caption1b text-white disabled:opacity-50"
          >
            수락
          </button>
          <button
            type="button"
            disabled={isResponding}
            onClick={onDecline}
            className="whitespace-nowrap rounded-sm border-1 border-solid border-error px-16 py-8 text-caption1b text-error disabled:opacity-50"
          >
            거절
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionOffer;
