'use client';

import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formKeys, getForm } from '@/entities/form';
import { getSurvey, surveyKeys } from '@/entities/survey';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { useModalDialog } from '@/shared/model';
import { Button } from '@/shared/ui';
import SelectDateInput from '@/shared/ui/SelectDateInput';
import {
  formatDateTimeValue,
  fromOffsetDateTime,
  RegistrationTable,
  TableColumn,
} from '../../../common';
import ScheduleSection from '../ScheduleSection';

type UserType = 'STANDARD' | 'TRAINEE';
type ApplicationType = 'PRE' | 'FIELD';

interface FormEntry {
  id: string;
  label: string;
  mode: 'application' | 'survey';
  userType: UserType;
  applicationType: ApplicationType;
}

// 박람회 상세의 폼 생성 모달과 같은 조합이다
const ENTRIES: FormEntry[] = [
  {
    id: 'pre-standard',
    label: '일반 사전등록',
    mode: 'application',
    userType: 'STANDARD',
    applicationType: 'PRE',
  },
  {
    id: 'field-standard',
    label: '일반 현장등록',
    mode: 'application',
    userType: 'STANDARD',
    applicationType: 'FIELD',
  },
  {
    id: 'pre-trainee',
    label: '연수자 사전등록',
    mode: 'application',
    userType: 'TRAINEE',
    applicationType: 'PRE',
  },
  {
    id: 'field-trainee',
    label: '연수자 현장등록',
    mode: 'application',
    userType: 'TRAINEE',
    applicationType: 'FIELD',
  },
  {
    id: 'survey-standard',
    label: '참가자 만족도 조사',
    mode: 'survey',
    userType: 'STANDARD',
    applicationType: 'PRE',
  },
  {
    id: 'survey-trainee',
    label: '연수자 만족도 조사',
    mode: 'survey',
    userType: 'TRAINEE',
    applicationType: 'PRE',
  },
];

interface FormRow extends FormEntry {
  /** 없으면 null, 조회 중이면 undefined */
  form?: { title: string; startDate?: string; endDate?: string } | null;
  error?: Error;
}

type Action = { row: FormRow; kind: 'create' | 'edit' };

/** 폼 만들기·수정 화면 주소. 저장·삭제 뒤 신청관리 폼 탭으로 돌아오게 returnTo 를 붙인다 */
const toEditorPath = (
  expoId: string,
  { kind, row }: Action,
  startDate?: Date | null,
  endDate?: Date | null,
) => {
  const params = new URLSearchParams({
    type: row.userType,
    mode: row.mode,
    applicationType: row.applicationType,
    startDate: startDate?.toISOString() ?? '',
    endDate: endDate?.toISOString() ?? '',
    returnTo: 'schedule',
  });
  return `/admin/form/${kind}/${encodeURIComponent(expoId)}?${params}`;
};

const toDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** 등록용 폼은 신청 기간이 필요해 고른 뒤 만들기·수정 화면으로 넘긴다(박람회 상세 모달과 같은 값) */
const PeriodDialog = ({
  action,
  onConfirm,
  onClose,
}: {
  action: Action;
  onConfirm: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
}) => {
  const dialogRef = useModalDialog({ onClose });
  const [startDate, setStartDate] = useState(
    toDate(action.row.form?.startDate),
  );
  const [endDate, setEndDate] = useState(toDate(action.row.form?.endDate));
  const isInvalid = !!startDate && !!endDate && startDate >= endDate;

  return (
    <div
      className="bg-black/50 fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${action.row.label} 신청 기간`}
        tabIndex={-1}
        className="flex w-full max-w-[420px] flex-col gap-16 rounded-sm bg-white p-24 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-h3b text-black">
          {action.row.label} 폼 {action.kind === 'create' ? '만들기' : '수정'}
        </p>
        <p className="break-keep text-body2r text-gray-500">
          신청 기간을 고르면 폼 {action.kind === 'create' ? '만들기' : '수정'}{' '}
          화면으로 이동합니다.
        </p>
        <SelectDateInput
          placeholder="시작 날짜"
          value={startDate}
          onChange={setStartDate}
        />
        <SelectDateInput
          placeholder="마감 날짜"
          value={endDate}
          onChange={setEndDate}
        />
        {isInvalid && (
          <p role="alert" className="text-caption1r text-error">
            마감 날짜는 시작 날짜보다 늦어야 합니다.
          </p>
        )}
        <div className="flex gap-8">
          <Button variant="gray" onClick={onClose}>
            닫기
          </Button>
          <Button
            disabled={!startDate || !endDate || isInvalid}
            onClick={() =>
              startDate && endDate && onConfirm(startDate, endDate)
            }
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
};

/** 행사 입장용 등록 폼과 만족도 조사. 있으면 수정, 없으면 만들기로 보낸다 */
const RegistrationFormSection = ({ expoId }: { expoId: string }) => {
  const router = useRouter();
  const [action, setAction] = useState<Action | null>(null);

  const results = useQueries({
    queries: ENTRIES.map((entry) =>
      entry.mode === 'application'
        ? {
            queryKey: [
              ...formKeys.detail(expoId, entry.userType, entry.applicationType),
              { admin: true },
            ],
            queryFn: () =>
              getForm(expoId, entry.userType, entry.applicationType, {
                admin: true,
              }),
            retry: false,
            // 없는 폼(404)은 정상이라 토스트를 띄우지 않는다. 다른 오류는 표에서 알린다
            meta: { silent: true },
          }
        : {
            queryKey: [
              ...surveyKeys.detail(expoId, entry.userType),
              { admin: true },
            ],
            queryFn: () => getSurvey(expoId, entry.userType, { admin: true }),
            retry: false,
            meta: { silent: true },
          },
    ),
  });

  const rows: FormRow[] = ENTRIES.map((entry, index) => {
    const { data, error, isLoading } = results[index];
    if (isLoading) return { ...entry, form: undefined };
    if (error)
      return getErrorStatus(error) === 404
        ? { ...entry, form: null }
        : { ...entry, error: error as Error };
    return {
      ...entry,
      form: data
        ? {
            title: data.title,
            ...('startDate' in data && {
              startDate: data.startDate,
              endDate: data.endDate,
            }),
          }
        : null,
    };
  });

  const open = (next: Action) => {
    // 만족도 조사는 신청 기간이 없어 바로 이동한다
    if (next.row.mode === 'survey') router.push(toEditorPath(expoId, next));
    else setAction(next);
  };

  const columns: TableColumn<FormRow>[] = [
    {
      key: 'label',
      label: '구분',
      flex: 1,
      render: ({ label }) => <p className="text-black">{label}</p>,
    },
    {
      key: 'title',
      label: '폼 제목',
      flex: 1.6,
      render: ({ form, error }) =>
        error ? (
          <p className="text-error">불러오지 못함</p>
        ) : form === undefined ? (
          <p className="text-gray-400">불러오는 중</p>
        ) : form ? (
          <p className="truncate text-black">{form.title}</p>
        ) : (
          <p className="text-gray-400">없음</p>
        ),
    },
    {
      key: 'period',
      label: '신청 기간',
      flex: 1.8,
      render: ({ form, mode }) =>
        mode === 'survey' || !form?.startDate || !form.endDate
          ? '-'
          : `${formatDateTimeValue(fromOffsetDateTime(form.startDate))} ~ ${formatDateTimeValue(fromOffsetDateTime(form.endDate))}`,
    },
    {
      key: 'actions',
      label: '관리',
      flex: 0.6,
      render: (row) =>
        row.error ? (
          <button
            type="button"
            className="text-body2r text-main-600"
            onClick={() =>
              results[ENTRIES.findIndex(({ id }) => id === row.id)].refetch()
            }
          >
            다시 시도
          </button>
        ) : row.form === undefined ? null : (
          <button
            type="button"
            className="text-body2r text-main-600"
            onClick={() => open({ row, kind: row.form ? 'edit' : 'create' })}
          >
            {row.form ? '수정' : '만들기'}
          </button>
        ),
    },
  ];

  return (
    <ScheduleSection
      title="등록용 폼·만족도 조사"
      description="행사 입장 사전·현장등록 폼과 만족도 조사입니다. 저장하면 이 화면으로 돌아옵니다."
    >
      <RegistrationTable
        columns={columns}
        rows={rows}
        emptyText="폼 정보가 없습니다."
        footerText="등록용 폼·만족도 조사"
        footerCount={rows.filter(({ form }) => !!form).length}
        minWidth="800px"
        maxHeight="none"
      />
      {action && (
        <PeriodDialog
          action={action}
          onClose={() => setAction(null)}
          onConfirm={(startDate, endDate) =>
            router.push(toEditorPath(expoId, action, startDate, endDate))
          }
        />
      )}
    </ScheduleSection>
  );
};

export default RegistrationFormSection;
