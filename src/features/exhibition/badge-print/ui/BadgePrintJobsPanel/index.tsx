'use client';

import { useBadgePrintJobs } from '../../model/useBadgePrintJobs';

const STATUS_LABEL = {
  NEEDS_CHECK: '확인 필요',
  FAILED: '출력 실패',
} as const;

const toTime = (value: string) =>
  value.includes('T') ? value.slice(11, 19) : value;

/**
 * 종이가 나왔는지 알 수 없는 작업(확인 필요)과 재시도를 다 쓴 작업(실패).
 * 실제로 나왔으면 "처리 완료", 안 나왔으면 "다시 출력"을 누른다
 */
const BadgePrintJobsPanel = ({ expoId }: { expoId: string }) => {
  const { data, isError, resolve, resolvingJobId } = useBadgePrintJobs(expoId);
  const jobs = data ?? [];

  return (
    <section className="flex flex-col gap-12 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div className="flex items-center justify-between gap-12">
        <p className="text-body1b text-black">확인이 필요한 명찰</p>
        <span className="text-caption1r text-gray-500">
          오늘 {jobs.length}건 · 5초마다 갱신
        </span>
      </div>
      <p className="break-keep text-caption1r text-gray-600">
        출력대에서 명찰이 실제로 나왔는지 확인해 주세요. 나왔으면 처리 완료, 안
        나왔으면 다시 출력을 누릅니다. 다시 출력은 비어 있는 출력대가
        가져갑니다.
      </p>
      {isError && (
        <p className="text-caption1r text-error">
          목록을 불러오지 못했습니다. 잠시 후 다시 시도합니다.
        </p>
      )}
      {jobs.length === 0 ? (
        <p className="rounded-sm bg-gray-100 px-16 py-16 text-center text-body2r text-gray-500">
          확인이 필요한 명찰이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-8">
          {jobs.map((job) => {
            const busy = resolvingJobId === job.jobId;
            return (
              <li
                key={job.jobId}
                className="flex flex-wrap items-center justify-between gap-12 rounded-sm bg-gray-100 px-16 py-12"
              >
                <div className="flex flex-col gap-4">
                  <p className="text-body2b text-black">
                    {job.name}
                    {job.school && (
                      <span className="ml-8 text-caption1r text-gray-600">
                        {job.school}
                      </span>
                    )}
                  </p>
                  <p className="text-caption1r text-gray-500">
                    {STATUS_LABEL[job.status as keyof typeof STATUS_LABEL] ??
                      job.status}{' '}
                    · {toTime(job.updatedAt)}
                  </p>
                </div>
                <div className="flex gap-8">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void resolve(job.jobId, 'REQUEUE')}
                    className="rounded-sm bg-main-600 px-16 py-8 text-caption1b text-white disabled:opacity-50"
                  >
                    다시 출력
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void resolve(job.jobId, 'DONE')}
                    className="rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-8 text-caption1b text-gray-700 disabled:opacity-50"
                  >
                    처리 완료
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default BadgePrintJobsPanel;
