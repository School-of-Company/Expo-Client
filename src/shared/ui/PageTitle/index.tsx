import { ArrowLeft } from '@/shared/assets/icons';

interface PageTitleProps {
  title: React.ReactNode;
  /** 제목 아래 화면 설명 */
  description?: React.ReactNode;
  /** 제목 오른쪽에 두는 이동 링크·버튼 */
  action?: React.ReactNode;
  /** 지정하면 제목 왼쪽에 뒤로 가기 버튼을 둔다 */
  onBack?: () => void;
}

/** 화면 맨 위 제목. 모든 화면에서 왼쪽 정렬·같은 크기로 보인다 */
const PageTitle = ({ title, description, action, onBack }: PageTitleProps) => (
  <div className="flex flex-wrap items-end justify-between gap-12">
    <div className="flex min-w-0 items-start gap-12">
      {onBack && (
        // 아이콘 크기는 그대로 두고 누르는 영역만 44px 로 넓힌다
        <button
          type="button"
          aria-label="뒤로 가기"
          className="-m-6 flex h-[44px] w-[44px] flex-none items-center justify-center"
          onClick={onBack}
        >
          <ArrowLeft size={32} />
        </button>
      )}
      <div className="min-w-0 space-y-8">
        <h1 className="break-keep text-h2b text-black mobile:text-body1b">
          {title}
        </h1>
        {description && (
          <p className="break-keep text-body2r text-gray-500 mobile:text-caption1r">
            {description}
          </p>
        )}
      </div>
    </div>
    {action}
  </div>
);

export default PageTitle;
