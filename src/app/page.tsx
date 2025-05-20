import { Metadata } from 'next';
import { ExhibitionListPage } from '@/views/exhibition/list';

export const metadata: Metadata = {
  title: '박람회 목록',
  description:
    '등록된 박람회를 한눈에 확인하고 새 박람회를 생성하거나 기존 박람회를 관리할 수 있는 관리자 메인 페이지입니다.',
};

export default function Home() {
  return <ExhibitionListPage />;
}
