/**
 * 박람회 기능 의존 계산. 서버(ExpoFeatureCatalog)와 같은 규칙이며
 * Expo-Expo-Server docs/expo-feature-examples.json 예제로 같은 결과가 나오는지 확인한다(featurePlan.check.ts).
 * - 자식을 켜면 모든 조상 선행 기능도 켠다(autoEnabled)
 * - 부모를 끄면 자식 선택값은 남기고 실효만 끈다(deactivated)
 * - 부모를 다시 켜면 남아 있던 자식이 실효 ON이 된다(reactivated)
 * - 같은 요청에서 부모 OFF와 그 자식 ON은 모순이다
 */
export interface CatalogItem {
  key: string;
  requires: string[];
}

export type FeatureChanges = Record<string, boolean>;

export interface FeaturePlan {
  configured: Set<string>;
  effective: Set<string>;
  /** 선택값이 ON인데 선행 기능 때문에 실효 OFF인 키 → 실효 OFF인 직접 선행 키 */
  blockedBy: Record<string, string[]>;
  autoEnabled: string[];
  reactivated: string[];
  deactivated: string[];
}

export type CatalogError = 'DUPLICATE_KEY' | 'MISSING_REQUIRES' | 'CYCLE';
export type PlanError = 'UNKNOWN_KEY' | 'CONTRADICTION';

/** 카탈로그가 그릴 수 있는 모양인지 확인한다. 문제가 없으면 null */
export const validateCatalog = (
  catalog: CatalogItem[],
): CatalogError | null => {
  const keys = new Set<string>();
  for (const { key } of catalog) {
    if (keys.has(key)) return 'DUPLICATE_KEY';
    keys.add(key);
  }
  if (catalog.some(({ requires }) => requires.some((key) => !keys.has(key))))
    return 'MISSING_REQUIRES';

  const requiresOf = new Map(catalog.map((item) => [item.key, item.requires]));
  const done = new Set<string>();
  const visiting = new Set<string>();
  const hasCycle = (key: string): boolean => {
    if (done.has(key)) return false;
    if (visiting.has(key)) return true;
    visiting.add(key);
    if ((requiresOf.get(key) ?? []).some(hasCycle)) return true;
    visiting.delete(key);
    done.add(key);
    return false;
  };
  return catalog.some(({ key }) => hasCycle(key)) ? 'CYCLE' : null;
};

/** 모든 조상 선행 키. 카탈로그 순서 */
export const ancestorsOf = (catalog: CatalogItem[], key: string): string[] => {
  const requiresOf = new Map(catalog.map((item) => [item.key, item.requires]));
  const found = new Set<string>();
  const visit = (current: string) =>
    (requiresOf.get(current) ?? []).forEach((parent) => {
      if (found.has(parent)) return;
      found.add(parent);
      visit(parent);
    });
  visit(key);
  return catalog.map((item) => item.key).filter((k) => found.has(k));
};

/** 모든 자손 키(이 키를 직접·간접으로 선행 기능으로 두는 키). 카탈로그 순서 */
export const descendantsOf = (catalog: CatalogItem[], key: string): string[] =>
  catalog
    .map((item) => item.key)
    .filter((k) => k !== key && ancestorsOf(catalog, k).includes(key));

const effectiveOf = (catalog: CatalogItem[], configured: Set<string>) => {
  const requiresOf = new Map(catalog.map((item) => [item.key, item.requires]));
  const memo = new Map<string, boolean>();
  const isOn = (key: string): boolean => {
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    const on =
      configured.has(key) && (requiresOf.get(key) ?? []).every((k) => isOn(k));
    memo.set(key, on);
    return on;
  };
  return new Set(catalog.map((item) => item.key).filter(isOn));
};

export const planFeatures = (
  catalog: CatalogItem[],
  before: Iterable<string>,
  changes: FeatureChanges,
): FeaturePlan | PlanError => {
  const keys = new Set(catalog.map((item) => item.key));
  const changed = Object.keys(changes);
  if (changed.some((key) => !keys.has(key))) return 'UNKNOWN_KEY';
  const contradicts = changed.some(
    (key) =>
      changes[key] &&
      ancestorsOf(catalog, key).some((parent) => changes[parent] === false),
  );
  if (contradicts) return 'CONTRADICTION';

  const configuredBefore = new Set(before);
  const configured = new Set(configuredBefore);
  changed.forEach((key) =>
    changes[key] ? configured.add(key) : configured.delete(key),
  );
  const auto = new Set<string>();
  changed
    .filter((key) => changes[key])
    .forEach((key) =>
      ancestorsOf(catalog, key).forEach((parent) => {
        if (!configured.has(parent)) auto.add(parent);
        configured.add(parent);
      }),
    );

  const effectiveBefore = effectiveOf(catalog, configuredBefore);
  const effective = effectiveOf(catalog, configured);
  const order = catalog.map((item) => item.key);
  // 선택값이 그대로인 키만 실효가 "따라서" 바뀐 것으로 본다
  const kept = order.filter(
    (key) =>
      !(key in changes) && configuredBefore.has(key) && configured.has(key),
  );

  const blockedBy: Record<string, string[]> = {};
  catalog.forEach(({ key, requires }) => {
    if (configured.has(key) && !effective.has(key))
      blockedBy[key] = requires.filter((parent) => !effective.has(parent));
  });

  return {
    configured,
    effective,
    blockedBy,
    autoEnabled: order.filter((key) => auto.has(key)),
    reactivated: kept.filter(
      (key) => !effectiveBefore.has(key) && effective.has(key),
    ),
    deactivated: kept.filter(
      (key) => effectiveBefore.has(key) && !effective.has(key),
    ),
  };
};

/**
 * 화면에서 토글 하나를 바꿀 때 초안을 고친다. 서버에 모순 요청(부모 OFF + 자식 ON)을 보내지 않도록
 * 켜면 초안의 조상 OFF를, 끄면 초안의 자손 ON을 지운다(지운 키는 서버 값으로 돌아간다).
 * 조상 자동 ON은 초안에 넣지 않고 planFeatures 가 보여 준다(서버도 같은 계산으로 켠다)
 */
export const toggleDraft = (
  catalog: CatalogItem[],
  draft: FeatureChanges,
  key: string,
  enabled: boolean,
): { draft: FeatureChanges; dropped: string[] } => {
  const next: FeatureChanges = { ...draft, [key]: enabled };
  const related = enabled
    ? ancestorsOf(catalog, key)
    : descendantsOf(catalog, key);
  const dropped = related.filter((k) => next[k] === !enabled);
  dropped.forEach((k) => delete next[k]);
  return { draft: next, dropped };
};

/** 서버 선택값과 다른 초안 항목만 저장 요청에 싣는다 */
export const toChanges = (
  configuredOnServer: Set<string>,
  draft: FeatureChanges,
): { key: string; enabled: boolean }[] =>
  Object.entries(draft)
    .filter(([key, enabled]) => configuredOnServer.has(key) !== enabled)
    .map(([key, enabled]) => ({ key, enabled }));
