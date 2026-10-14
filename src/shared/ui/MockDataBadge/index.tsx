interface MockDataBadgeProps {
  /** 이 데이터를 대신할 서버 이슈. 예: 'Expo-Attendance-Server#131' */
  issue: string;
}

/** 서버 API 가 없어 예시 데이터로 그린 영역에 붙인다. 실제 값으로 오해하지 않게 한다 */
const MockDataBadge = ({ issue }: MockDataBadgeProps) => (
  <span
    title={`서버 연결 전 예시 데이터입니다 (${issue})`}
    className="inline-flex shrink-0 items-center rounded-full border-1 border-dashed border-gray-300 px-8 py-2 text-caption2r text-gray-500"
  >
    예시 데이터
  </span>
);

export default MockDataBadge;
