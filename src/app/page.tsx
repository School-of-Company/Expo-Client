import { redirect } from 'next/navigation';

// 관리자 화면은 모두 /admin 아래에 있다. 예전 첫 화면(박람회 목록)으로 들어오면 그리로 보낸다
export default function Home() {
  redirect('/admin');
}
