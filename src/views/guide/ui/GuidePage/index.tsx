import { Header } from '@/widgets/layout';
import { GUIDE_SECTIONS } from '../../model/guideSections';

/**
 * 처음 쓰는 관리자를 위한 서비스 사용법 화면.
 * 위쪽 목차에서 원하는 항목으로 바로 내려갈 수 있다
 */
const GuidePage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <main className="flex flex-1 justify-center px-16 pb-60">
        <div className="flex w-full max-w-[816px] flex-col gap-40">
          <div className="flex flex-col gap-12">
            <h1 className="text-h2b text-black">사용법</h1>
            <p className="break-keep text-body2r text-gray-600">
              박람회 생성부터 폼·QR·현장등록·명찰 출력까지 관리자 기능을 쓰는
              순서와 차이를 안내합니다.
            </p>
          </div>

          <nav aria-label="사용법 목차">
            <ul className="flex flex-wrap gap-8">
              {GUIDE_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex min-h-[44px] items-center rounded-full border-1 border-solid border-gray-200 px-16 text-caption1r text-gray-600 hover:border-main-600 hover:text-main-600"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {GUIDE_SECTIONS.map((section) => {
            const List = section.ordered ? 'ol' : 'ul';
            return (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="flex scroll-mt-[96px] flex-col gap-16"
              >
                <div className="flex flex-col gap-8">
                  <h2
                    id={`${section.id}-title`}
                    className="text-h3b text-black"
                  >
                    {section.title}
                  </h2>
                  <p className="break-keep text-body2r text-gray-600">
                    {section.summary}
                  </p>
                </div>
                <List className="flex flex-col gap-8">
                  {section.items.map((item, index) => (
                    <li
                      key={item.title}
                      className="flex gap-16 rounded-md border-1 border-solid border-gray-200 bg-white px-20 py-16"
                    >
                      {section.ordered && (
                        <span
                          aria-hidden="true"
                          className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-main-600 text-caption1b text-white"
                        >
                          {index + 1}
                        </span>
                      )}
                      <div className="flex flex-col gap-4">
                        <p className="text-body2b text-black">{item.title}</p>
                        <p className="break-keep text-caption1r text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </List>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default GuidePage;
