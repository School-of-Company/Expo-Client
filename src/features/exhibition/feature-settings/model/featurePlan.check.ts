/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/exhibition/feature-settings/model/featurePlan.check.ts`
 * expoFeatureExamples.json 은 Expo-Expo-Server docs/expo-feature-examples.json 복사본이다. 서버 예제가 바뀌면 함께 바꾼다
 */
import assert from 'node:assert/strict';
import {
  InvalidFeatureSettingsError,
  parseFeatureSettings,
} from '../api/expoFeatures';
import examples from './expoFeatureExamples.json';
import {
  CatalogItem,
  descendantsOf,
  planFeatures,
  toChanges,
  toggleDraft,
  validateCatalog,
} from './featurePlan';

// 서버 운영 카탈로그(docs/expo-feature-settings.md 카탈로그 표)의 키와 선행 관계
const CATALOG: CatalogItem[] = [
  { key: 'PRE_REGISTRATION', requires: [] },
  { key: 'FIELD_REGISTRATION', requires: [] },
  { key: 'COMPANION_REGISTRATION', requires: [] },
  { key: 'QR_ADMISSION', requires: [] },
  { key: 'PAPER_QR', requires: ['QR_ADMISSION'] },
  { key: 'STANDARD_PROGRAM', requires: [] },
  { key: 'TRAINING_PROGRAM', requires: [] },
  { key: 'STANDARD_ATTENDANCE', requires: ['STANDARD_PROGRAM'] },
  { key: 'TRAINING_ATTENDANCE', requires: ['TRAINING_PROGRAM'] },
  { key: 'SURVEY', requires: [] },
  { key: 'SURVEY_LOTTERY', requires: ['SURVEY'] },
  { key: 'AUTO_NOTIFICATION', requires: [] },
  { key: 'BULK_MESSAGE', requires: [] },
];

const sorted = (values: Iterable<string>) => Array.from(values).sort();

// 서버와 같은 예제로 같은 결과가 나와야 한다
examples.plans.forEach((example) => {
  const catalog = (example as { catalog?: CatalogItem[] }).catalog ?? CATALOG;
  const plan = planFeatures(
    catalog,
    example.before,
    example.changes as Record<string, boolean>,
  );
  assert.ok(typeof plan === 'object', example.name);
  assert.deepEqual(
    sorted(plan.configured),
    sorted(example.configuredOn),
    example.name,
  );
  assert.deepEqual(
    sorted(plan.effective),
    sorted(example.effectiveOn),
    example.name,
  );
  assert.deepEqual(plan.blockedBy, example.blockedBy, example.name);
  assert.deepEqual(plan.autoEnabled, example.autoEnabled, example.name);
  assert.deepEqual(plan.reactivated, example.reactivated, example.name);
  assert.deepEqual(plan.deactivated, example.deactivated, example.name);
});

assert.equal(
  planFeatures(CATALOG, ['SURVEY'], { SURVEY: false, SURVEY_LOTTERY: true }),
  'CONTRADICTION',
);
assert.equal(
  planFeatures(CATALOG, [], { UNKNOWN_FEATURE: true }),
  'UNKNOWN_KEY',
);
assert.equal(examples.invalidPlans.length, 2);

const catalogErrors = examples.invalidCatalogs.map(({ catalog }) =>
  validateCatalog(catalog),
);
assert.deepEqual(catalogErrors, ['DUPLICATE_KEY', 'MISSING_REQUIRES', 'CYCLE']);
assert.equal(validateCatalog(CATALOG), null);

assert.deepEqual(descendantsOf(CATALOG, 'SURVEY'), ['SURVEY_LOTTERY']);

// 화면 초안: 자식을 켠 뒤 부모를 끄면 자식 켜기를 지워 모순 요청을 만들지 않는다
let step = toggleDraft(CATALOG, {}, 'SURVEY_LOTTERY', true);
assert.deepEqual(step, { draft: { SURVEY_LOTTERY: true }, dropped: [] });
step = toggleDraft(CATALOG, step.draft, 'SURVEY', false);
assert.deepEqual(step, {
  draft: { SURVEY: false },
  dropped: ['SURVEY_LOTTERY'],
});
// 부모 끄기 초안이 있을 때 자식을 켜면 부모 끄기를 지운다
step = toggleDraft(CATALOG, step.draft, 'SURVEY_LOTTERY', true);
assert.deepEqual(step, {
  draft: { SURVEY_LOTTERY: true },
  dropped: ['SURVEY'],
});
// 어느 초안이든 서버가 400으로 거절하는 모순이 되지 않는다
assert.ok(typeof planFeatures(CATALOG, ['SURVEY'], step.draft) === 'object');

// 서버 값과 같은 초안 항목은 보내지 않는다
assert.deepEqual(
  toChanges(new Set(['SURVEY']), { SURVEY: true, PAPER_QR: true }),
  [{ key: 'PAPER_QR', enabled: true }],
);

// 응답 검사: 정상 응답은 order 순으로 정렬하고, 모양이 다르거나 다른 박람회면 거절한다
const feature = (key: string, order: number, requires: string[] = []) => ({
  key,
  label: key,
  description: '',
  group: 'G',
  order,
  requires,
  configuredEnabled: true,
  effectiveEnabled: true,
  blockedBy: [],
  readiness: { status: 'READY', reasons: [] },
});
const response = {
  expoId: 'ABC',
  revision: 1,
  groups: [{ key: 'G', label: '그룹' }],
  features: [feature('B', 2, ['A']), feature('A', 1)],
  authentication: {
    participantPhoneVerificationRequired: true,
    participantPhoneVerificationRevision: 0,
  },
  applied: null,
};
assert.deepEqual(
  parseFeatureSettings(response, 'abc').features.map((f) => f.key),
  ['A', 'B'],
);
assert.throws(
  () => parseFeatureSettings(response, 'other'),
  InvalidFeatureSettingsError,
);
assert.throws(
  () => parseFeatureSettings({ ...response, features: undefined }, 'abc'),
  InvalidFeatureSettingsError,
);
assert.throws(
  () =>
    parseFeatureSettings(
      {
        ...response,
        features: [{ ...feature('A', 1), configuredEnabled: 'Y' }],
      },
      'abc',
    ),
  InvalidFeatureSettingsError,
);
assert.throws(
  () =>
    parseFeatureSettings(
      { ...response, features: [feature('A', 1, ['MISSING'])] },
      'abc',
    ),
  InvalidFeatureSettingsError,
);

console.log('featurePlan check ok');
