import Header from '../Header';

interface PageShellProps {
  /** 헤더 바로 아래에 붙는 탭 같은 보조 내비게이션 */
  subHeader?: React.ReactNode;
  children: React.ReactNode;
}

/** 관리 화면 공통 틀. 헤더와 가운데 정렬된 본문 영역을 그린다 */
const PageShell = ({ subHeader, children }: PageShellProps) => (
  <div className="flex min-h-screen flex-col gap-[30px]">
    <Header />
    {subHeader}
    <main className="flex flex-1 justify-center p-16">{children}</main>
  </div>
);

export default PageShell;
