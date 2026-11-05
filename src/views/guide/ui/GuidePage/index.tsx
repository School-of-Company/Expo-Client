import { Warning } from '@/shared/assets/icons';
import { COLORS } from '@/shared/config';
import { Header } from '@/widgets/layout';
import {
  FLOW_STEPS,
  FORM_TYPES,
  PRINT_STATION_STEPS,
  PRINT_STATION_WARNING,
  QR_TYPES,
  REGISTRATION_COMPARE,
} from '../../model/guideSections';
import GuideSection from '../GuideSection';
import GuideToc from '../GuideToc';

const CARD = 'rounded-lg border-1 border-solid border-gray-100 bg-white';

/**
 * 처음 쓰는 관리자를 위한 서비스 사용법 화면.
 * 섹션마다 내용에 맞는 모양(흐름·카드·비교표·체크리스트)으로 보여 준다
 */
const GuidePage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
      <Header />

      <div className="border-b border-solid border-gray-100 bg-white px-16">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 py-48 mobile:py-32">
          <span className="w-fit rounded-full bg-main-100 px-10 py-4 text-caption2b text-main-600">
            관리자 가이드
          </span>
          <h1 className="text-h1m text-black mobile:text-h2b">Expo 사용법</h1>
          <p className="max-w-[560px] break-keep text-body2r text-gray-500">
            박람회를 만들고 폼·QR로 신청을 받아 현장에서 운영하기까지, 처음 쓰는
            관리자가 알아야 할 내용을 순서대로 정리했습니다.
          </p>
        </div>
      </div>

      <main className="flex justify-center px-16 pb-100 pt-48 mobile:pt-0">
        <div className="flex w-full max-w-[1200px] gap-48 mobile:flex-col mobile:gap-24">
          <aside className="w-[200px] shrink-0 mobile:sticky mobile:top-72 mobile:z-[5] mobile:w-auto">
            <GuideToc />
          </aside>

          <div className="flex min-w-0 max-w-[800px] flex-1 flex-col gap-64 mobile:gap-48">
            <GuideSection
              id="exhibition-flow"
              summary="박람회 하나를 열어 현장에서 운영하기까지 이 순서로 진행합니다."
            >
              <ol className={`${CARD} flex flex-col px-24 py-8 mobile:px-16`}>
                {FLOW_STEPS.map((step, index) => (
                  <li key={step.title} className="relative flex gap-16 py-16">
                    {index < FLOW_STEPS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-[-16px] left-[13px] top-[48px] w-2 bg-main-100"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-main-600 text-caption1b text-white"
                    >
                      {index + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-6 pt-2">
                      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                        <p className="text-body2b text-black">{step.title}</p>
                        <span className="rounded-sm bg-[#f4f5f7] px-8 py-2 text-caption2r text-gray-500">
                          {step.where}
                        </span>
                      </div>
                      <p className="break-keep text-caption1r text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </GuideSection>

            <GuideSection
              id="form-types"
              summary="폼 생성에서 고르는 세 가지 폼입니다. 쓰임과 대상이 다릅니다."
            >
              <ul className="grid grid-cols-3 gap-12 mobile:grid-cols-1">
                {FORM_TYPES.map((form) => (
                  <li
                    key={form.title}
                    className={`${CARD} flex flex-col gap-16 p-20`}
                  >
                    <span className="flex h-40 w-40 items-center justify-center rounded-md bg-main-100">
                      <form.icon fill={COLORS.main600} />
                    </span>
                    <div className="flex flex-col gap-4">
                      <p className="text-body1b text-black">{form.title}</p>
                      <p className="break-keep text-caption1r text-gray-500">
                        {form.description}
                      </p>
                    </div>
                    <dl className="mt-auto flex flex-col gap-8 border-t border-solid border-gray-100 pt-14">
                      {form.meta.map((meta) => (
                        <div key={meta.label} className="flex gap-12">
                          <dt className="w-28 shrink-0 text-caption2b text-gray-400">
                            {meta.label}
                          </dt>
                          <dd className="break-keep text-caption2r text-gray-600">
                            {meta.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            </GuideSection>

            <GuideSection
              id="registration-types"
              summary="같은 대상이라도 언제 신청하느냐에 따라 등록 유형이 나뉩니다."
            >
              <div className={`${CARD} overflow-hidden`}>
                <table className="w-full table-fixed border-collapse text-left">
                  <thead>
                    <tr className="bg-[#fafbfd]">
                      <th
                        scope="col"
                        className="w-[120px] px-20 py-14 mobile:w-[68px] mobile:px-12"
                      >
                        <span className="sr-only">구분</span>
                      </th>
                      {REGISTRATION_COMPARE.columns.map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className="px-20 py-14 text-body2b text-black mobile:px-12"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REGISTRATION_COMPARE.rows.map((row) => (
                      <tr
                        key={row.label}
                        className="border-t border-solid border-gray-100"
                      >
                        <th
                          scope="row"
                          className="px-20 py-16 align-top text-caption1b text-gray-400 mobile:px-12"
                        >
                          {row.label}
                        </th>
                        {row.values.map((value) => (
                          <td
                            key={value}
                            className="break-keep px-20 py-16 align-top text-caption1r text-gray-700 mobile:px-12"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GuideSection>

            <GuideSection
              id="qr-types"
              summary="박람회 상세의 QR 화면에서 탭별로 다룹니다."
            >
              <ul className="flex flex-col gap-12">
                {QR_TYPES.map((qr) => (
                  <li
                    key={qr.title}
                    className={`${CARD} flex gap-16 p-20 mobile:flex-col mobile:gap-12`}
                  >
                    <span className="flex h-40 w-40 shrink-0 items-center justify-center rounded-md bg-main-100">
                      <qr.icon fill={COLORS.main600} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-8">
                      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                        <p className="text-body1b text-black">{qr.title}</p>
                        <span className="rounded-sm bg-main-100 px-8 py-2 text-caption2b text-main-600">
                          QR › {qr.tab}
                        </span>
                      </div>
                      <p className="break-keep text-caption1r text-gray-600">
                        {qr.description}
                      </p>
                      <p className="text-caption2r text-gray-400">{qr.who}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </GuideSection>

            <GuideSection
              id="print-station"
              summary="프린터가 연결된 노트북에서 입장한 교사·연수자의 명찰을 자동으로 출력합니다."
            >
              <div className="flex flex-col gap-12">
                <ol className={`${CARD} flex flex-col`}>
                  {PRINT_STATION_STEPS.map((step, index) => (
                    <li
                      key={step.title}
                      className="flex gap-16 border-t border-solid border-gray-100 px-24 py-20 first:border-t-0 mobile:px-16"
                    >
                      <span className="w-12 shrink-0 text-body2b text-main-600">
                        {index + 1}
                      </span>
                      <div className="flex min-w-0 flex-col gap-6">
                        <p className="text-body2b text-black">{step.title}</p>
                        <p className="break-keep text-caption1r text-gray-600">
                          {step.description}
                        </p>
                        {step.code && (
                          <code className="mt-4 w-fit rounded-sm bg-gray-900 px-10 py-6 font-mono text-caption2r text-white">
                            {step.code}
                          </code>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <div
                  role="note"
                  className="flex items-start gap-12 rounded-lg border-1 border-solid border-[#f5c9ca] bg-[#fdf3f3] px-20 py-16"
                >
                  <span className="shrink-0">
                    <Warning fill={COLORS.error} />
                  </span>
                  <p className="break-keep pt-2 text-caption1r text-error">
                    {PRINT_STATION_WARNING}
                  </p>
                </div>
              </div>
            </GuideSection>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuidePage;
