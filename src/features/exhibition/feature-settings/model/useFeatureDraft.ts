import { useMemo, useState } from 'react';
import {
  ExpoFeatureSettings,
  UpdateExpoFeatureSettingsRequest,
} from '../api/expoFeatures';
import {
  FeatureChanges,
  FeaturePlan,
  planFeatures,
  toChanges,
  toggleDraft,
} from './featurePlan';

/** 초안을 시작할 때의 서버 값. 그 뒤 서버 값이 바뀌었는지(다른 탭·관리자, 409) 비교한다 */
interface DraftBase {
  revision: number;
  phoneRevision: number;
  configured: Set<string>;
  phoneRequired: boolean;
}

export interface ServerChange {
  key: string;
  enabled: boolean;
}

const configuredOf = (settings: ExpoFeatureSettings) =>
  new Set(
    settings.features
      .filter((feature) => feature.configuredEnabled)
      .map((feature) => feature.key),
  );

export const useFeatureDraft = (settings: ExpoFeatureSettings) => {
  const [draft, setDraft] = useState<FeatureChanges>({});
  const [phoneDraft, setPhoneDraft] = useState<boolean>();
  const [base, setBase] = useState<DraftBase | null>(null);
  // 방금 토글 때문에 초안에서 빠진 키. 화면에 이유를 알린다
  const [dropped, setDropped] = useState<{ key: string; by: string }[]>([]);

  const catalog = settings.features;
  const configured = useMemo(() => configuredOf(settings), [settings]);
  const phoneRequired =
    settings.authentication.participantPhoneVerificationRequired;

  const changes = useMemo(
    () => toChanges(configured, draft),
    [configured, draft],
  );
  const phoneChanged = phoneDraft !== undefined && phoneDraft !== phoneRequired;
  const changeCount = changes.length + (phoneChanged ? 1 : 0);
  const isDirty = changeCount > 0;

  // 초안을 바로 적용한 미리보기. 초안은 모순이 생기지 않게 고치므로 항상 계산된다
  const plan = useMemo(() => {
    const result = planFeatures(
      catalog,
      configured,
      Object.fromEntries(changes.map((c) => [c.key, c.enabled])),
    );
    return typeof result === 'string' ? null : result;
  }, [catalog, configured, changes]) as FeaturePlan | null;

  const ensureBase = () =>
    setBase(
      (prev) =>
        prev ?? {
          revision: settings.revision,
          phoneRevision:
            settings.authentication.participantPhoneVerificationRevision,
          configured,
          phoneRequired,
        },
    );

  const toggle = (key: string, enabled: boolean) => {
    ensureBase();
    const next = toggleDraft(catalog, draft, key, enabled);
    setDraft(next.draft);
    setDropped(next.dropped.map((k) => ({ key: k, by: key })));
  };

  const setPhone = (required: boolean) => {
    ensureBase();
    setPhoneDraft(required);
  };

  const reset = () => {
    setDraft({});
    setPhoneDraft(undefined);
    setBase(null);
    setDropped([]);
  };

  // 초안이 있는데 그 사이 서버 값이 바뀌었으면 저장 전에 확인받는다
  const isStale =
    isDirty &&
    base !== null &&
    (base.revision !== settings.revision ||
      base.phoneRevision !==
        settings.authentication.participantPhoneVerificationRevision);

  const serverChanges: ServerChange[] = base
    ? catalog
        .filter((f) => base.configured.has(f.key) !== configured.has(f.key))
        .map((f) => ({ key: f.key, enabled: configured.has(f.key) }))
    : [];
  const serverPhoneChange =
    base && base.phoneRequired !== phoneRequired ? phoneRequired : undefined;

  /** 최신 서버 값을 새 기준으로 삼고 내 초안을 그 위에 다시 얹는다 */
  const rebase = () =>
    setBase({
      revision: settings.revision,
      phoneRevision:
        settings.authentication.participantPhoneVerificationRevision,
      configured,
      phoneRequired,
    });

  const toRequest = (): UpdateExpoFeatureSettingsRequest => ({
    expectedRevision: settings.revision,
    changes,
    ...(phoneChanged && {
      participantPhoneVerificationRequired: phoneDraft,
      expectedPhoneRevision:
        settings.authentication.participantPhoneVerificationRevision,
    }),
  });

  return {
    plan,
    changes,
    changeCount,
    isDirty,
    phoneValue: phoneDraft ?? phoneRequired,
    phoneChanged,
    dropped,
    toggle,
    setPhone,
    reset,
    isStale,
    serverChanges,
    serverPhoneChange,
    rebase,
    toRequest,
  };
};
