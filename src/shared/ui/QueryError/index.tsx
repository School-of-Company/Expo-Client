import Button from '../Button';

interface QueryErrorProps {
  message: string;
  onRetry: () => void;
}

/** 화면에 필요한 조회가 실패했을 때 빈 화면 대신 보여 주고 다시 시도하게 한다 */
const QueryError = ({ message, onRetry }: QueryErrorProps) => (
  <div
    role="alert"
    className="flex w-full flex-1 flex-col items-center justify-center gap-16 p-16"
  >
    <p className="break-keep text-center text-body2r text-gray-500">
      {message}
    </p>
    <div className="w-[160px]">
      <Button variant="white" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  </div>
);

export default QueryError;
