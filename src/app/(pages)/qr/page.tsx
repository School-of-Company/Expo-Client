import { Metadata } from 'next';
import { EntryQrPage, EntryQrQuery } from '@/views/entry-qr';

export const metadata: Metadata = {
  title: '입장 QR',
  description: '사전신청 문자 링크로 박람회 입장 QR을 확인하는 페이지입니다.',
  // 링크에 입장 코드나 전화번호가 들어가므로 검색 노출과 Referer 전송을 막는다
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

const page = ({ searchParams }: { searchParams: EntryQrQuery }) => {
  return <EntryQrPage query={searchParams} />;
};

export default page;
