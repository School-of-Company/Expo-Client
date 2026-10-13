'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { withLoading } from '@/shared/hocs';
import { Button, ToggleButton } from '@/shared/ui';
import {
  MAX_LOTTERY_NUMBERS,
  parseLotteryNumbers,
} from '../../model/parseLotteryNumbers';
import {
  useSurveyLottery,
  useUpdateSurveyLottery,
} from '../../model/useSurveyLottery';

const LotterySettingsForm = ({ expoId }: { expoId: string }) => {
  const { data, isLoading, error } = useSurveyLottery(expoId);
  const { mutate, isPending } = useUpdateSurveyLottery(expoId);
  const [enabled, setEnabled] = useState(false);
  const [numbersInput, setNumbersInput] = useState('');
  const [surveyUrl, setSurveyUrl] = useState('');

  useEffect(() => {
    if (!data) return;
    setEnabled(data.enabled);
    setNumbersInput(data.numbers.join(', '));
  }, [data]);

  useEffect(() => {
    setSurveyUrl(`${window.location.origin}/survey/${expoId}`);
  }, [expoId]);

  const parsed = parseLotteryNumbers(numbersInput);
  const currentSequence = data?.currentSequence ?? 0;
  // 이미 지나간 순번은 다시 오지 않아 당첨이 나지 않는다
  const passedNumbers =
    parsed.numbers?.filter((number) => number <= currentSequence) ?? [];

  const handleSave = () => {
    if (!parsed.numbers) return;
    mutate(
      { enabled, numbers: parsed.numbers },
      {
        onSuccess: () => toast.success('경품 추첨 설정을 저장했습니다.'),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const copySurveyUrl = () => {
    navigator.clipboard
      .writeText(surveyUrl)
      .then(() => toast.success('URL이 클립보드에 복사되었습니다.'))
      .catch(() => toast.error('URL 복사에 실패했습니다. 다시 시도해주세요.'));
  };

  if (error) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
        {error.message}
      </div>
    );
  }

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[816px] flex-col gap-36">
        <div className="space-y-8">
          <p className="text-h2b text-black">경품 추첨 설정</p>
          <p className="break-keep text-body2r text-gray-500">
            참가자 만족도 조사(공개 링크)에 응답한 순서가 당첨 번호와 같으면 그
            응답이 당첨됩니다. 켜져 있는 동안 박람회 기간 내내 진행합니다.
          </p>
        </div>

        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <p className="text-h4b text-black">경품 추첨</p>
            <div className="flex items-center gap-12">
              <p className="text-body2r text-gray-600">
                {enabled ? '켜짐' : '꺼짐'}
              </p>
              <ToggleButton value={enabled} onChange={setEnabled} />
            </div>
          </div>
          <p className="break-keep text-caption1r text-gray-400">
            켜면 설문 화면에 행운 이벤트 안내와 전화번호 입력(선택)이 보입니다.
            진행 중에 끄면 추첨만 멈추고 그동안의 응답과 당첨 기록은 그대로
            보존됩니다. 다시 켜면 순번을 이어서 셉니다.
          </p>
        </section>

        <section className="space-y-12">
          <p className="text-h4b text-black">현재 순번</p>
          <p className="text-h2b text-main-600">{currentSequence}번째 응답</p>
          <p className="break-keep text-caption1r text-gray-400">
            추첨이 켜져 있는 동안 받은 응답 수입니다. 다음 응답이{' '}
            {currentSequence + 1}번째가 됩니다.
          </p>
        </section>

        <section className="space-y-12">
          <p className="text-h4b text-black">당첨 번호</p>
          <textarea
            rows={4}
            value={numbersInput}
            onChange={(e) => setNumbersInput(e.target.value)}
            placeholder="예: 10, 50, 100"
            className="w-full resize-none rounded-sm border-1 border-solid border-gray-200 px-16 py-12 text-body2r"
          />
          {parsed.numbers ? (
            <p className="break-keep text-caption1r text-gray-400">
              쉼표나 줄바꿈으로 구분해 1 이상의 정수를 최대{' '}
              {MAX_LOTTERY_NUMBERS}개 입력합니다(현재 {parsed.numbers.length}
              개). 비워 두면 추첨하지 않습니다.
            </p>
          ) : (
            <p className="text-caption1r text-red-500">{parsed.error}</p>
          )}
          {passedNumbers.length > 0 && (
            <p className="break-keep text-caption1r text-red-500">
              {passedNumbers.join(', ')}번은 이미 지나간 순번이라 당첨이 나지
              않습니다.
            </p>
          )}
        </section>

        <Button onClick={handleSave} disabled={isPending || !!parsed.error}>
          {isPending ? '저장 중...' : '저장하기'}
        </Button>

        <section className="space-y-12">
          <p className="text-h4b text-black">만족도 조사 링크</p>
          <p className="break-all text-body2r text-gray-600">{surveyUrl}</p>
          <Button variant="white" onClick={copySurveyUrl}>
            링크 복사
          </Button>
        </section>
      </div>
    ),
  });
};

export default LotterySettingsForm;
