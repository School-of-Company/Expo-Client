'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { downloadQrImage } from '@/shared/libs/downloadQrImage';
import { useModalDialog } from '@/shared/model';
import { SearchInput } from '@/shared/ui/SearchInput';
import { RegistrationTable, SectionError, TableColumn } from '../../../common';
import { useRegistrationExpo } from '../../../common';
import { OCCUPATION_LABEL, Q_MAX_LENGTH } from '../../../common/model/ledger';
import { AdminParticipantItem } from '../../api/participantSearchApi';
import {
  getParticipantQrErrorMessage,
  getParticipantsErrorMessage,
  maskParticipantPhone,
  toParticipantQuery,
  useAdminParticipantQr,
  useAdminParticipants,
} from '../../model/participantSearch';

const SEARCH_DEBOUNCE_MS = 300;

type Row = AdminParticipantItem & { id: number };

const QrDialog = ({
  expoId,
  target,
  onClose,
}: {
  expoId: string;
  target: AdminParticipantItem;
  onClose: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data, error, isPending, refetch } = useAdminParticipantQr(
    expoId,
    target.participantId,
  );

  const dialogRef = useModalDialog({ onClose });

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
        aria-label={`${target.name} 입장 QR`}
        tabIndex={-1}
        className="flex w-full max-w-[360px] flex-col items-center gap-16 rounded-sm bg-white p-24 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-h3b text-black">{target.name}</p>
        {isPending && <p className="text-body2r text-gray-500">불러오는 중…</p>}
        {error && (
          <div className="w-full">
            <SectionError
              message={getParticipantQrErrorMessage(error)}
              onRetry={() => refetch()}
            />
          </div>
        )}
        {data && (
          <>
            <QRCodeCanvas
              ref={canvasRef}
              value={JSON.stringify({
                participantId: data.participantId,
                code: data.code,
              })}
              size={240}
              marginSize={2}
            />
            <p className="text-caption1r text-gray-500">
              현장 입장 시 이 QR을 스캔하세요
            </p>
            <button
              type="button"
              onClick={() => downloadQrImage(canvasRef.current!, target.name)}
              className="w-full rounded-sm border-1 border-solid border-main-600 px-24 py-14 text-body2b text-main-600"
            >
              QR 저장
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="w-full rounded-sm bg-main-600 px-24 py-14 text-body2b text-white"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

const ParticipantSearch = () => {
  const { expoId } = useRegistrationExpo();
  const [keyword, setKeyword] = useState('');
  const [q, setQ] = useState<string | undefined>();
  const [qrTarget, setQrTarget] = useState<AdminParticipantItem | null>(null);

  // 입력을 멈춘 뒤에 서버로 보낸다
  useEffect(() => {
    const timer = setTimeout(
      () => setQ(toParticipantQuery(keyword)),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [keyword]);

  const {
    data,
    error,
    isPending,
    isError,
    isFetchNextPageError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useAdminParticipants(expoId, q);
  const rows: Row[] | undefined = data?.map((item) => ({
    ...item,
    id: item.participantId,
  }));

  const columns: TableColumn<Row>[] = [
    { key: 'name', label: '이름', render: ({ name }) => name },
    {
      key: 'phone',
      label: '연락처 (마스킹)',
      render: ({ phoneNumber }) => maskParticipantPhone(phoneNumber),
    },
    {
      key: 'occupation',
      label: '직업',
      render: ({ occupation }) =>
        occupation ? OCCUPATION_LABEL[occupation] : '-',
    },
    {
      key: 'role',
      label: '구분',
      render: ({ representativeId }) =>
        representativeId ? '동행자' : '대표자',
    },
    {
      key: 'qr',
      label: '입장 QR',
      render: (row) => (
        <button
          type="button"
          onClick={() => setQrTarget(row)}
          className="text-body2r text-main-600 underline"
        >
          입장 QR 보기
        </button>
      ),
    },
  ];

  return (
    <section className="w-full max-w-[1200px] space-y-16">
      <div className="space-y-6">
        <p className="text-body1b text-black">참가자 검색</p>
        <p className="text-caption1r text-gray-400">
          QR 을 분실한 참가자를 이름 또는 전화번호로 찾아 입장 QR 을 확인합니다.
          프로그램 신청 이력은 접수대장에서 확인하세요.
        </p>
      </div>

      <SearchInput
        label="참가자 이름 또는 전화번호 검색"
        placeholder="이름 또는 전화번호"
        value={keyword}
        onChange={(value) => setKeyword(value.slice(0, Q_MAX_LENGTH))}
      />

      {isError && !rows ? (
        <SectionError
          message={getParticipantsErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : (
        <RegistrationTable
          columns={columns}
          rows={rows ?? []}
          emptyText={
            !q
              ? '이름 또는 전화번호를 입력해 검색하세요.'
              : isPending
                ? '불러오는 중입니다.'
                : '검색된 참가자가 없습니다.'
          }
          footerText={hasNextPage ? '불러온 참가자' : '참가자'}
          footerCount={rows?.length ?? 0}
          minWidth="700px"
        >
          {isError ? (
            <SectionError
              message={getParticipantsErrorMessage(error)}
              onRetry={() =>
                isFetchNextPageError ? fetchNextPage() : refetch()
              }
            />
          ) : (
            hasNextPage && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-8 py-12 text-body2r text-main-600 underline disabled:text-gray-400"
                >
                  {isFetchingNextPage ? '불러오는 중…' : '더 보기'}
                </button>
              </div>
            )
          )}
        </RegistrationTable>
      )}

      {qrTarget && (
        <QrDialog
          expoId={expoId}
          target={qrTarget}
          onClose={() => setQrTarget(null)}
        />
      )}
    </section>
  );
};

export default ParticipantSearch;
