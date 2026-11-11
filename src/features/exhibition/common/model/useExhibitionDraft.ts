import { useEffect, useState } from 'react';
import { UseFormReset, UseFormWatch } from 'react-hook-form';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';

const DRAFT_KEY = 'exhibitionCreateDraft';

interface Draft {
  values: Partial<ExhibitionFormData>;
  step: number;
}

// 사생활 보호 모드 등에서 저장소가 막혀도 화면은 그대로 쓴다
const read = (): Draft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
};

const write = (draft: Draft) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // 저장하지 못해도 입력은 계속한다
  }
};

export const clearExhibitionDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // 지우지 못해도 다음 저장이 덮어쓴다
  }
};

/**
 * 생성 화면 입력을 브라우저에 자동 저장하고 다시 열면 이어서 쓴다.
 * 사진 파일은 저장소에 넣을 수 없어 빼고 저장하므로 다시 올려야 한다
 */
export const useExhibitionDraft = ({
  enabled,
  step,
  setStep,
  watch,
  reset,
  defaultValues,
}: {
  enabled: boolean;
  step: number;
  setStep: (step: number) => void;
  watch: UseFormWatch<ExhibitionFormData>;
  reset: UseFormReset<ExhibitionFormData>;
  defaultValues: ExhibitionFormData;
}) => {
  const [restored, setRestored] = useState(false);
  const [ready, setReady] = useState(!enabled);

  // 서버 렌더와 어긋나지 않게 화면이 뜬 뒤에 불러온다
  useEffect(() => {
    if (!enabled) return;
    const draft = read();
    if (draft) {
      reset({ ...defaultValues, ...draft.values, image: '' });
      setStep(draft.step);
      setRestored(true);
    }
    setReady(true);
    // 처음 한 번만 불러온다
  }, []);

  useEffect(() => {
    if (!enabled || !ready) return;
    const save = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image, ...values } = watch();
      write({ values, step });
    };
    save();
    const subscription = watch(save);
    return () => subscription.unsubscribe();
  }, [enabled, ready, step, watch]);

  const discard = () => {
    clearExhibitionDraft();
    reset(defaultValues);
    setStep(0);
    setRestored(false);
  };

  return { restored, discard };
};
