'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { XMark } from '@/shared/assets/icons';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { useModalDialog } from '@/shared/model';
import { Button, Loading } from '@/shared/ui';
import { formatDateTime, SectionError } from '../../../common';
import {
  GroupMessageChannel,
  GroupMessagePreview,
  GroupMessageSource,
  postGroupMessageJob,
  postGroupMessagePreview,
  postGroupMessageRetry,
} from '../../../common/api/groupMessageApi';
import { LedgerFilter, LedgerRow } from '../../../common/model/ledger';
import {
  GROUP_MESSAGE_MAX_LENGTH,
  GROUP_MESSAGE_SELECTED_MAX,
  GROUP_MESSAGE_VARIABLES,
  getFilteredScopeBlocker,
  isFinalJobStatus,
  isGoneJobError,
  JOB_STATUS_LABEL,
  loadLastGroupMessageJob,
  saveLastGroupMessageJob,
  toGroupMessageFilter,
  useGroupMessageConfig,
  useGroupMessageJob,
} from '../../model/groupMessage';
import { MESSAGE_TEMPLATES } from '../../model/messageTemplates';
import GroupMessageJobItems from '../GroupMessageJobItems';
import KakaoTemplatePanel from '../KakaoTemplatePanel';

type Scope = 'SELECTED' | 'FILTERED';

interface GroupMessageModalProps {
  expoId: string;
  selectedRows: LedgerRow[];
  filter: LedgerFilter;
  filterCount: number;
  onClose: () => void;
}

const MISSING_REASON_LABEL: Record<string, string> = {
  TEMPLATE_DATA_MISSING: '문구 변수에 넣을 값이 없음',
};

const PREVIEW_ITEM_LIMIT = 20;

const CHANNEL_LABEL: Record<GroupMessageChannel, string> = {
  SMS: '문자(SMS)',
  KAKAO: '카카오 알림톡',
};

const errorMessage = (error: unknown) =>
  getErrorStatus(error) === 409
    ? '대상이나 권한이 바뀌었습니다. 미리보기를 다시 만들어 주세요.'
    : error instanceof Error
      ? error.message
      : '요청을 처리하지 못했습니다.';

const GroupMessageModal = ({
  expoId,
  selectedRows,
  filter,
  filterCount,
  onClose,
}: GroupMessageModalProps) => {
  const queryClient = useQueryClient();
  const [scope, setScope] = useState<Scope>(
    selectedRows.length > 0 ? 'SELECTED' : 'FILTERED',
  );
  const [channel, setChannel] = useState<GroupMessageChannel>('SMS');
  const [body, setBody] = useState('');
  const [templateId, setTemplateId] = useState('');
  // 같은 제출은 같은 멱등 키를 쓴다. 미리보기가 새로 만들어지거나 재시도가 성공하면 바꾼다
  const [preview, setPreview] = useState<{
    source: GroupMessageSource;
    result: GroupMessagePreview;
    executeKey: string;
  } | null>(null);
  const [last, setLast] = useState(() => loadLastGroupMessageJob(expoId));
  const jobId = last?.jobId ?? null;
  const [notice, setNotice] = useState<string | null>(null);
  // 재시도는 같은 키로 다시 보내야 중복 발송이 없다. 성공하면 바꾼다
  const [retryKey, setRetryKey] = useState(() => crypto.randomUUID());

  const config = useGroupMessageConfig(expoId);
  const job = useGroupMessageJob(expoId, jobId);

  // 닫기 버튼과 같이 Escape 로도 닫는다. 보내기 버튼은 기본 포커스로 두지 않는다
  const dialogRef = useModalDialog({ onClose });

  const channels = config.data?.enabled ? config.data.channels : {};
  const smsEnabled = channels.SMS?.enabled === true;
  const kakaoEnabled = channels.KAKAO?.enabled === true;
  const kakaoTemplates = kakaoEnabled ? (channels.KAKAO?.templates ?? []) : [];
  const template = kakaoTemplates.find(({ id }) => id === templateId);

  // SMS 가 꺼져 있고 카카오만 쓸 수 있으면 카카오로 시작한다
  useEffect(() => {
    if (!smsEnabled && kakaoEnabled) setChannel('KAKAO');
  }, [smsEnabled, kakaoEnabled]);

  const source = useMemo<GroupMessageSource>(() => {
    const target: GroupMessageSource['scope'] =
      scope === 'SELECTED'
        ? { kind: 'SELECTED', applicationIds: selectedRows.map(({ id }) => id) }
        : { kind: 'FILTERED', filter: toGroupMessageFilter(filter) };
    return channel === 'SMS'
      ? { scope: target, channel: 'SMS', body, fallbackToSms: false }
      : { scope: target, channel: 'KAKAO', templateId, fallbackToSms: false };
  }, [scope, selectedRows, filter, channel, body, templateId]);
  const hasContent = channel === 'SMS' ? body.trim() !== '' : !!template;
  // 미리보기 뒤에 범위나 문구가 바뀌면 그 미리보기로는 보낼 수 없다
  const isPreviewCurrent =
    preview !== null &&
    JSON.stringify(preview.source) === JSON.stringify(source);

  const scopeBlocker =
    scope === 'SELECTED' && selectedRows.length === 0
      ? '보낼 신청을 선택해주세요.'
      : scope === 'SELECTED' && selectedRows.length > GROUP_MESSAGE_SELECTED_MAX
        ? `선택 신청은 최대 ${GROUP_MESSAGE_SELECTED_MAX}건까지 보낼 수 있습니다.`
        : scope === 'FILTERED' && filterCount === 0
          ? '현재 필터에 맞는 신청이 없습니다.'
          : scope === 'FILTERED'
            ? getFilteredScopeBlocker(filter)
            : null;

  const previewMutation = useMutation({
    mutationFn: () => postGroupMessagePreview(expoId, source),
    onSuccess: (result) => {
      setPreview({
        source,
        result,
        executeKey: crypto.randomUUID(),
      });
      setNotice(null);
    },
  });

  const executeMutation = useMutation({
    mutationFn: () =>
      postGroupMessageJob(expoId, preview!.result.previewId, {
        source: preview!.source,
        targetFingerprint: preview!.result.targetFingerprint,
        idempotencyKey: preview!.executeKey,
      }),
    onSuccess: (result) => {
      const next = {
        jobId: result.jobId,
        source: preview!.source,
        targetFingerprint: preview!.result.targetFingerprint,
      };
      saveLastGroupMessageJob(expoId, next);
      setLast(next);
    },
    onError: (error) => {
      if (getErrorStatus(error) === 409) setPreview(null);
    },
  });

  const retryMutation = useMutation({
    mutationFn: () =>
      postGroupMessageRetry(expoId, jobId!, {
        source: last!.source,
        targetFingerprint: last!.targetFingerprint,
        idempotencyKey: retryKey,
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(['groupMessageJob', expoId, jobId], result);
      setRetryKey(crypto.randomUUID());
    },
  });

  const handleSend = () => {
    if (!preview || !isPreviewCurrent || executeMutation.isPending) return;
    if (Date.parse(preview.result.expiresAt) <= Date.now()) {
      setPreview(null);
      setNotice(
        '미리보기 유효 시간이 지났습니다. 미리보기를 다시 만들어 주세요.',
      );
      return;
    }
    const { recipientCount, messageCount } = preview.result;
    if (
      !window.confirm(
        `${recipientCount}개 번호로 ${CHANNEL_LABEL[channel]} ${messageCount}건을 보낼까요? 보낸 뒤에는 취소할 수 없습니다.`,
      )
    )
      return;
    setNotice(null);
    executeMutation.mutate();
  };

  // 보관한 대상이 오래돼 재시도가 거절되면 처음부터 대상을 다시 확인하게 한다
  const retryStale = getErrorStatus(retryMutation.error) === 409;
  const resetJob = () => {
    saveLastGroupMessageJob(expoId, null);
    retryMutation.reset();
    setLast(null);
  };

  // 보관한 작업을 조회할 수 없으면(만료·소유자 변경) 보관분을 비워 새로 보낼 수 있게 한다
  const jobGone = isGoneJobError(job.error);
  useEffect(() => {
    if (jobGone) resetJob();
  }, [jobGone]);

  const handleRetry = () => {
    if (!last || retryMutation.isPending) return;
    if (
      !window.confirm(
        `확정 실패 ${jobData?.counts.failed ?? 0}건을 다시 보낼까요? 보낸 뒤에는 취소할 수 없습니다.`,
      )
    )
      return;
    retryMutation.mutate();
  };

  const isEditable = jobId === null;

  // 작성 중인 내용이 있으면 덮어쓰기 전에 묻는다
  const handleTemplateClick = (templateBody: string) => {
    if (
      body.trim() !== '' &&
      body !== templateBody &&
      !window.confirm('작성 중인 내용을 예시 문구로 바꿀까요?')
    )
      return;
    setBody(templateBody.slice(0, GROUP_MESSAGE_MAX_LENGTH));
  };
  const mutationError =
    previewMutation.error ?? executeMutation.error ?? retryMutation.error;
  // Notification 서버는 작업을 만들 때 저장한 fingerprint 와만 비교해서, 새 미리보기로는 재시도가 통과하지 못한다
  const retryStaleMessage =
    '대상이 바뀌어 이 작업은 재시도할 수 없습니다. 창을 닫고 필요한 대상만 새로 선택해 발송해 주세요.';

  const renderConfigGate = () => {
    if (config.isLoading) {
      return (
        <div className="flex justify-center py-40">
          <Loading />
        </div>
      );
    }
    if (config.isError) {
      return (
        <SectionError
          message="문자 발송 설정을 불러오지 못했습니다."
          onRetry={() => config.refetch()}
        />
      );
    }
    return (
      <p role="status" className="text-body2r text-gray-500">
        지금은 문자·알림톡 발송이 모두 꺼져 있습니다. 알림 서버 설정을
        확인해주세요.
      </p>
    );
  };

  const jobData = job.data;
  const isJobFinal = jobData ? isFinalJobStatus(jobData.status) : false;

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-message-title"
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-[792px] flex-col gap-[32px] overflow-y-auto rounded-sm bg-white px-[40px] py-[36px] outline-none mobile:px-20"
      >
        <div className="flex items-center">
          <p
            id="group-message-title"
            className="flex-grow text-center text-h2r text-black mobile:text-body1r"
          >
            문자·알림톡 보내기
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

        {!smsEnabled && !kakaoEnabled ? (
          renderConfigGate()
        ) : (
          <>
            <section className="space-y-[10px]">
              <p className="text-h3b text-black">받는 대상</p>
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                {(
                  [
                    ['SELECTED', '선택한 신청', selectedRows.length],
                    ['FILTERED', '현재 필터 전체', filterCount],
                  ] as const
                ).map(([value, label, count]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={!isEditable}
                    onClick={() => setScope(value)}
                    className={`flex items-center gap-12 rounded-sm border-1 border-solid px-16 py-12 text-left duration-200 ${
                      scope === value ? 'border-main-600' : 'border-gray-200'
                    }`}
                  >
                    {scope === value ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                    <span className="text-body2r text-black">{label}</span>
                    <span className="ml-auto text-body2r text-main-600">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-caption1r text-gray-500">
                신청한 참가자의 대표자 번호로 보냅니다. 개인 번호나 알림 번호로
                대신 보내지 않습니다. 필터 전체는 최대 5,000건입니다.
              </p>
              {scopeBlocker && (
                <p role="alert" className="text-caption1r text-error">
                  {scopeBlocker}
                </p>
              )}
            </section>

            <section className="space-y-[10px]">
              <p className="text-h3b text-black">발송 수단</p>
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                {(['SMS', 'KAKAO'] as const).map((value) => {
                  const enabled = value === 'SMS' ? smsEnabled : kakaoEnabled;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!isEditable || !enabled}
                      onClick={() => setChannel(value)}
                      className={`flex items-center gap-12 rounded-sm border-1 border-solid px-16 py-12 text-left duration-200 disabled:opacity-50 ${
                        channel === value
                          ? 'border-main-600'
                          : 'border-gray-200'
                      }`}
                    >
                      {channel === value ? (
                        <CheckedBoxIcon />
                      ) : (
                        <CheckBoxIcon />
                      )}
                      <span className="text-body2r text-black">
                        {CHANNEL_LABEL[value]}
                      </span>
                      {!enabled && (
                        <span className="ml-auto text-caption1r text-gray-400">
                          사용 불가
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-caption1r text-gray-500">
                SMS 자동 대체는 사용하지 않습니다. 알림톡이 실패해도 문자로 대신
                보내지 않습니다.
              </p>
            </section>

            {channel === 'SMS' ? (
              <section className="space-y-[10px]">
                <label
                  htmlFor="group-message-body"
                  className="text-h3b text-black"
                >
                  내용
                </label>
                <div className="flex flex-wrap items-center gap-8">
                  <span className="text-caption1r text-gray-400">
                    예시 문구
                  </span>
                  {MESSAGE_TEMPLATES.map((template) => (
                    <button
                      key={template.label}
                      type="button"
                      disabled={!isEditable}
                      onClick={() => handleTemplateClick(template.body)}
                      className="rounded-full bg-main-100 px-12 py-4 text-caption1r text-main-600 hover:bg-main-200"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
                <textarea
                  id="group-message-body"
                  value={body}
                  disabled={!isEditable}
                  maxLength={GROUP_MESSAGE_MAX_LENGTH}
                  onChange={(event) => setBody(event.target.value)}
                  rows={6}
                  placeholder="보낼 내용을 입력하세요"
                  className="w-full resize-none rounded-sm border-1 border-solid border-gray-200 px-16 py-12 text-body2r text-black outline-none focus:border-main-600"
                />
                <div className="flex flex-wrap items-center gap-8">
                  {GROUP_MESSAGE_VARIABLES.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      disabled={!isEditable}
                      onClick={() =>
                        setBody((prev) =>
                          `${prev}${variable}`.slice(
                            0,
                            GROUP_MESSAGE_MAX_LENGTH,
                          ),
                        )
                      }
                      className="rounded-sm border-1 border-solid border-gray-200 px-12 py-6 text-caption1r text-gray-500 hover:border-main-600 hover:text-main-600"
                    >
                      {variable}
                    </button>
                  ))}
                  <span className="ml-auto text-caption1r text-gray-400">
                    {body.length}/{GROUP_MESSAGE_MAX_LENGTH}
                  </span>
                </div>
                <p className="text-caption1r text-gray-500">
                  변수를 쓰면 신청별로 문구를 만들고, 변수가 없으면 같은
                  번호에는 한 번만 보냅니다.
                </p>
                <p className="text-caption1r text-error">
                  {'{장소}'}는 사전등록 회차에만 있어 프로그램 신청자는 발송에서
                  빠집니다.
                </p>
              </section>
            ) : (
              <section className="space-y-[10px]">
                <label
                  htmlFor="group-message-template"
                  className="text-h3b text-black"
                >
                  승인 템플릿
                </label>
                <select
                  id="group-message-template"
                  value={templateId}
                  disabled={!isEditable}
                  onChange={(event) => setTemplateId(event.target.value)}
                  className="w-full rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-12 text-body2r text-black outline-none focus:border-main-600"
                >
                  <option value="">템플릿을 선택하세요</option>
                  {kakaoTemplates.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {kakaoTemplates.length === 0 && (
                  <p role="status" className="text-caption1r text-gray-500">
                    선택할 수 있는 승인 템플릿이 없습니다.
                  </p>
                )}
                {template && <KakaoTemplatePanel template={template} />}
              </section>
            )}

            {preview && (
              <section className="space-y-[10px]">
                <p className="text-h3b text-black">미리보기</p>
                {!isPreviewCurrent && (
                  <p role="status" className="text-caption1r text-error">
                    미리보기 이후 대상이나 내용이 바뀌었습니다. 다시 미리보기를
                    만들어야 보낼 수 있습니다.
                  </p>
                )}
                <p className="text-body2r text-gray-500">
                  신청 {preview.result.applicationCount}건 · 수신 번호{' '}
                  <span className="text-main-600">
                    {preview.result.recipientCount}
                  </span>
                  개 · 문자 {preview.result.messageCount}건 · 제외{' '}
                  {preview.result.missingCount}건 (유효{' '}
                  {formatDateTime(preview.result.expiresAt)}까지)
                </p>
                <ul className="max-h-[240px] space-y-8 overflow-y-auto rounded-sm border-1 border-solid border-gray-200 px-16 py-12">
                  {preview.result.items
                    .slice(0, PREVIEW_ITEM_LIMIT)
                    .map((item) => (
                      <li key={item.targetId} className="space-y-4 text-body2r">
                        <p className="text-gray-500">
                          {item.recipientMasked ?? '번호 없음'}
                          {item.missingReason && (
                            <span className="text-error">
                              {' '}
                              · 제외:{' '}
                              {MISSING_REASON_LABEL[item.missingReason] ??
                                item.missingReason}
                            </span>
                          )}
                        </p>
                        {item.content && (
                          <p className="whitespace-pre-wrap text-black">
                            {item.content}
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
                {preview.result.items.length > PREVIEW_ITEM_LIMIT && (
                  <p className="text-caption1r text-gray-400">
                    앞 {PREVIEW_ITEM_LIMIT}건만 표시합니다.
                  </p>
                )}
              </section>
            )}

            {jobData && (
              <section className="space-y-[10px]" aria-live="polite">
                <p className="text-h3b text-black">
                  발송 상태 · {JOB_STATUS_LABEL[jobData.status]}
                </p>
                <p className="text-body2r text-gray-500">
                  전체 {jobData.counts.total} · 전달{' '}
                  {jobData.counts.delivered + jobData.counts.accepted} · 진행{' '}
                  {jobData.counts.pending + jobData.counts.sending} · 실패{' '}
                  {jobData.counts.failed} · 결과 불명 {jobData.counts.unknown} ·
                  제외 {jobData.counts.missing}
                </p>
                {!isJobFinal && (
                  <p className="text-caption1r text-gray-400">
                    창을 닫아도 발송은 계속됩니다.
                  </p>
                )}
                {jobData.counts.unknown > 0 && (
                  <p className="text-caption1r text-gray-400">
                    결과 불명 건은 중복 발송을 막기 위해 재시도하지 않습니다.
                  </p>
                )}
                <GroupMessageJobItems items={jobData.items} />
              </section>
            )}

            {(notice || mutationError) && (
              <p role="alert" className="text-body2r text-error">
                {retryStale
                  ? retryStaleMessage
                  : (notice ?? errorMessage(mutationError))}
              </p>
            )}

            {jobId === null ? (
              <div className="grid grid-cols-2 gap-12">
                <Button
                  variant="white"
                  disabled={
                    !hasContent || !!scopeBlocker || previewMutation.isPending
                  }
                  onClick={() => previewMutation.mutate()}
                >
                  {previewMutation.isPending ? '만드는 중...' : '미리보기'}
                </Button>
                <Button
                  disabled={
                    !isPreviewCurrent ||
                    preview.result.recipientCount === 0 ||
                    executeMutation.isPending
                  }
                  onClick={handleSend}
                >
                  {executeMutation.isPending ? '시작하는 중...' : '보내기'}
                </Button>
              </div>
            ) : (
              isJobFinal && (
                <div className="grid grid-cols-2 gap-12">
                  {(jobData?.counts.failed ?? 0) > 0 && !retryStale && (
                    <Button
                      variant="white"
                      disabled={retryMutation.isPending}
                      onClick={handleRetry}
                    >
                      {retryMutation.isPending
                        ? '재시도 요청 중...'
                        : `실패 ${jobData?.counts.failed}건 재시도`}
                    </Button>
                  )}
                  <Button variant="white" onClick={resetJob}>
                    {retryStale ? '대상 다시 확인' : '새로 보내기'}
                  </Button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupMessageModal;
