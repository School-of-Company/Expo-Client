import {
  GroupMessageItemStatus,
  GroupMessageJobItem,
} from '../../../common/api/groupMessageApi';

const ITEM_STATUS_LABEL: Record<GroupMessageItemStatus, string> = {
  MISSING: '제외',
  PENDING: '대기',
  SENDING: '발송 중',
  ACCEPTED: '접수됨',
  DELIVERED: '전달됨',
  FAILED: '실패',
  UNKNOWN: '결과 불명',
};

// 확인이 필요한 건만 보여 준다. 전달·진행 중인 건은 건수로 충분하다
const ATTENTION_STATUSES: GroupMessageItemStatus[] = [
  'FAILED',
  'UNKNOWN',
  'MISSING',
];
const ITEM_LIMIT = 50;

const GroupMessageJobItems = ({ items }: { items: GroupMessageJobItem[] }) => {
  const attention = items.filter(({ status }) =>
    ATTENTION_STATUSES.includes(status),
  );
  if (attention.length === 0) return null;

  return (
    <div className="space-y-8">
      <ul className="max-h-[200px] space-y-4 overflow-y-auto rounded-sm border-1 border-solid border-gray-200 px-16 py-12 text-body2r">
        {attention.slice(0, ITEM_LIMIT).map((item) => (
          <li key={item.targetId} className="flex flex-wrap gap-8">
            <span className="text-gray-500">
              {item.recipientMasked ?? '번호 없음'}
            </span>
            <span
              className={item.status === 'FAILED' ? 'text-error' : 'text-black'}
            >
              {ITEM_STATUS_LABEL[item.status]}
            </span>
            {(item.failureReason ?? item.missingReason) && (
              <span className="text-gray-400">
                {item.failureReason ?? item.missingReason}
              </span>
            )}
          </li>
        ))}
      </ul>
      {attention.length > ITEM_LIMIT && (
        <p className="text-caption1r text-gray-400">
          앞 {ITEM_LIMIT}건만 표시합니다.
        </p>
      )}
    </div>
  );
};

export default GroupMessageJobItems;
