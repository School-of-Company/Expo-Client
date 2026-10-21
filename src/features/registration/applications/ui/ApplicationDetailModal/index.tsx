'use client';

import { AnswerList } from '@/entities/form';
import { XMark } from '@/shared/assets/icons';
import { useModalDialog } from '@/shared/model';
import { Button, Loading } from '@/shared/ui';
import { formatDateTime, SectionError } from '../../../common';
import {
  formatDefinitionSchedule,
  getLedgerErrorMessage,
  getPromotionWindowLabel,
  isCancellableStatus,
  LEDGER_STATUS_LABEL,
  LEDGER_STATUS_STYLE,
  OCCUPATION_LABEL,
  PROGRAM_TYPE_LABEL,
  toLedgerRow,
  useApplicationDetail,
  useCancelApplication,
  usePromoteApplication,
  useWaitlistContext,
} from '../../../common/model/ledger';

interface ApplicationDetailModalProps {
  expoId: string;
  applicationId: string;
  onClose: () => void;
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex gap-16">
    <dt className="w-[96px] flex-none text-body2r text-gray-500">{label}</dt>
    <dd className="min-w-0 text-body2r text-black">{value}</dd>
  </div>
);

const AnswerSection = ({
  title,
  questions,
  answers,
  currentInfo,
}: {
  title: string;
  questions: unknown;
  answers: Record<string, unknown> | null;
  currentInfo?: boolean;
}) => (
  <section className="space-y-[10px]">
    <p className="text-h3b text-black">{title}</p>
    <AnswerList
      questions={questions}
      answers={answers}
      currentInfo={currentInfo}
    />
  </section>
);

/** 신청 한 건을 원장에서 다시 조회해 최신 상태와 상태 변경 이력을 보여 준다 */
const ApplicationDetailModal = ({
  expoId,
  applicationId,
  onClose,
}: ApplicationDetailModalProps) => {
  const { data, error, isLoading, isError, refetch } = useApplicationDetail(
    expoId,
    applicationId,
  );
  const cancellation = useCancelApplication(expoId);
  const promotion = usePromoteApplication(expoId);

  const dialogRef = useModalDialog({ onClose });

  const row = data ? toLedgerRow(data) : null;
  // 이력은 오래된 순으로 보여 준다
  const history = data
    ? [...data.history].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    : [];

  const waitlist = useWaitlistContext(
    expoId,
    row?.status === 'WAITING' ? row : null,
  );

  const handlePromote = () => {
    if (!row || promotion.isPending) return;
    // 학생·보호자 묶음이면 서버가 구성원 하나만 지정해도 묶음 전체를 확정하거나 전부 대기로 둔다
    if (
      !window.confirm(
        `${row.name}님의 '${row.title}' 대기를 확정할까요? 전화로 참여 의사를 확인한 뒤에 진행하세요. 학생·보호자 묶음이면 묶음 전체가 함께 확정되며, 확정한 신청은 되돌릴 수 없습니다.`,
      )
    )
      return;
    promotion.mutate(row.id);
  };

  const handleCancel = () => {
    if (!row) return;
    const target = `${row.name}님`;
    // 확정 취소는 빈 자리로 대기자가 자동 승급된다
    const promotion =
      row.status === 'CONFIRMED' ? ' 대기자가 있으면 자동으로 확정됩니다.' : '';
    if (
      !window.confirm(
        `${target}의 '${row.title}' 신청을 취소할까요?${promotion} 취소한 신청은 되돌릴 수 없습니다.`,
      )
    )
      return;
    cancellation.mutate(row.id);
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-40">
          <Loading />
        </div>
      );
    }
    if (isError) {
      return (
        <SectionError
          message={getLedgerErrorMessage(
            error,
            '신청 상세를 불러오지 못했습니다.',
          )}
          onRetry={() => refetch()}
        />
      );
    }
    if (!row) {
      return (
        <p className="py-40 text-center text-body2r text-gray-400">
          신청을 찾을 수 없습니다. 원장에서 삭제되었거나 다른 행사의 신청입니다.
        </p>
      );
    }
    return (
      <>
        <section className="space-y-[10px]">
          <p className="text-h3b text-black">참가자</p>
          <dl className="space-y-8">
            <Field label="이름" value={row.name} />
            <Field
              label="구분"
              value={row.isRepresentative ? '대표자' : '동행자'}
            />
            <Field
              label="직업"
              value={row.occupation ? OCCUPATION_LABEL[row.occupation] : '-'}
            />
            {/* 연수 연결은 직업과 섞지 않고 따로 표시한다 */}
            <Field
              label="연수 연결"
              value={
                row.linkedTraineeId !== null
                  ? `연결됨 (연수자 ${row.linkedTraineeId})`
                  : '없음'
              }
            />
            <Field label="개인 번호" value={row.phoneNumber ?? '없음'} />
            <Field
              label="대표 수신 번호"
              value={row.notificationPhoneNumber ?? '없음'}
            />
          </dl>
        </section>

        <AnswerSection
          title="참가자 등록 답변 (현재)"
          questions={null}
          answers={data?.participant.information ?? null}
          currentInfo
        />

        <section className="space-y-[10px]">
          <p className="text-h3b text-black">신청</p>
          <dl className="space-y-8">
            <Field
              label="회차"
              value={`[${PROGRAM_TYPE_LABEL[row.programType]}] ${row.title}`}
            />
            <Field
              label="일시"
              value={formatDefinitionSchedule(row.startedAt, row.endedAt)}
            />
            <Field
              label="상태"
              value={
                <span className={LEDGER_STATUS_STYLE[row.status]}>
                  {LEDGER_STATUS_LABEL[row.status]}
                </span>
              }
            />
            <Field label="신청일시" value={formatDateTime(row.createdAt)} />
            <Field
              label="신청 ID"
              value={<span className="break-all">{row.id}</span>}
            />
          </dl>
        </section>

        <AnswerSection
          title="신청 당시 답변"
          questions={data?.questions ?? null}
          answers={data?.answers ?? null}
        />

        <section className="space-y-[10px]">
          <p className="text-h3b text-black">상태 변경 이력</p>
          {history.length === 0 ? (
            <p className="text-body2r text-gray-400">이력이 없습니다.</p>
          ) : (
            <ol className="space-y-8">
              {history.map((item) => (
                <li key={item.id} className="flex gap-16 text-body2r">
                  <span className="w-[120px] flex-none text-gray-500">
                    {formatDateTime(item.createdAt)}
                  </span>
                  <span className={LEDGER_STATUS_STYLE[item.status]}>
                    {LEDGER_STATUS_LABEL[item.status]}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {row.status === 'WAITING' && (
          <section className="space-y-[10px]">
            <p className="text-h3b text-black">대기 수동 확정</p>
            <dl className="space-y-8">
              <Field
                label="대기 순서"
                value={
                  waitlist.data
                    ? waitlist.data.position
                      ? `${waitlist.data.position}번째 / 대기 ${waitlist.data.total}건`
                      : `순서를 찾지 못했습니다 / 대기 ${waitlist.data.total}건`
                    : waitlist.isError
                      ? '확인하지 못했습니다'
                      : '확인 중'
                }
              />
              <Field
                label="승급 방식"
                value={
                  getPromotionWindowLabel(waitlist.data?.policy ?? null) ??
                  '확인 중'
                }
              />
            </dl>
            <p className="text-caption1r text-gray-400">
              자동 승급이 멈춘 뒤 대기 승급 마감 전까지만 확정할 수 있습니다.
              정원·자격·시간 충돌·진행 중 참여 제안은 서버가 다시 확인하며,
              실패해도 대기는 그대로 남습니다.
            </p>
            <Button disabled={promotion.isPending} onClick={handlePromote}>
              {promotion.isPending ? '확정하는 중...' : '대기 수동 확정'}
            </Button>
          </section>
        )}

        {isCancellableStatus(row.status) && (
          <section className="space-y-[10px]">
            <p className="text-caption1r text-gray-400">
              이 프로그램에 이미 출석한 신청은 서버가 취소를 거절합니다.
              입장했거나 취소 기간이 끝났어도 출석 전이면 관리자는 취소할 수
              있습니다.
            </p>
            <Button
              variant="white"
              disabled={cancellation.isPending}
              onClick={handleCancel}
            >
              {cancellation.isPending ? '취소하는 중...' : '신청 취소'}
            </Button>
          </section>
        )}
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-detail-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[640px] flex-col gap-[32px] overflow-y-auto rounded-sm bg-white px-[40px] py-[36px] outline-none mobile:px-20"
      >
        <div className="flex items-center">
          <p
            id="application-detail-title"
            className="flex-grow text-center text-h2r text-black mobile:text-body1r"
          >
            신청 상세
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-m-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center"
          >
            <XMark />
          </button>
        </div>
        {renderBody()}
      </div>
    </div>
  );
};

export default ApplicationDetailModal;
