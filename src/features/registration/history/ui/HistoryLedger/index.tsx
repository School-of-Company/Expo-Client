import { DetailHeader } from '@/shared/ui';

// 처리 이력은 공급 서비스별로 나뉜다. 공개 관리자 API가 생기기 전까지 mock 이력을 운영 이력처럼 보여 주지 않는다
const HISTORY_SOURCES = [
  {
    title: '신청·취소·승급 이력',
    source: 'Application',
    status: '공개 관리자 조회 API 구현 중 (Expo-Application-Server#93)',
  },
  {
    title: '그룹 문자 발송 이력',
    source: 'Notification',
    status:
      '내부 이력 API 구현 완료(Expo-Notification-Server#43), Application 공개 경로 연결 전',
  },
  {
    title: '모집 변경 이력',
    source: 'Expo',
    status: '공급 API 준비 전 (Expo-Expo-Server#94)',
  },
];

const HistoryLedger = () => (
  <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[54px]">
    <DetailHeader textCenter headerTitle="행정 이력" />

    <div
      role="status"
      className="space-y-16 rounded-sm border-1 border-solid border-gray-200 px-30 py-[28px] mobile:px-16"
    >
      <p className="text-body1b text-black">
        처리 이력은 서버 연결 후 제공됩니다.
      </p>
      <p className="text-body2r text-gray-500">
        이력은 출처 서비스별로 나뉘어 있어 각 서비스의 공개 조회 API가 준비되면
        이 화면에 연결합니다. 그 전에는 실제와 다른 임시 이력을 보여 주지
        않습니다.
      </p>
      <ul className="space-y-12">
        {HISTORY_SOURCES.map(({ title, source, status }) => (
          <li key={title} className="flex flex-wrap items-baseline gap-12">
            <span className="text-body2b text-black">{title}</span>
            <span className="text-caption1r text-gray-400">{source}</span>
            <span className="text-caption1r text-gray-500">{status}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default HistoryLedger;
