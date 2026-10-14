/**
 * 자체 점검: `node --experimental-strip-types src/features/program-form/model/versionConflict.check.ts`
 *
 * 관리자 두 명이 같은 폼을 고치는 충돌 흐름을 가짜 Form 서버로 돌린다.
 * 서버 규칙(스펙): PATCH 는 expectedVersion 이 현재 version 과 같을 때만 반영되고 version 이 1 오른다.
 */
import assert from 'node:assert/strict';
import { isVersionConflict, reapplyMine } from './versionConflict.ts';
import type {
  ProgramFormResponseDto,
  UpdateProgramFormRequestDto,
  CreateProgramFormRequestDto,
} from '@/entities/form';

const body = (title: string): CreateProgramFormRequestDto => ({
  title,
  informationText: '',
  participantType: null,
  startDate: '2026-11-01T00:00:00.000Z',
  endDate: '2026-11-30T00:00:00.000Z',
  dynamicForm: [],
});

const createFakeServer = () => {
  let form: ProgramFormResponseDto = {
    id: 'form-1',
    expoId: 'expo-1',
    ...body('처음 제목'),
    participantType: null,
    dynamicForm: [],
    purpose: 'PROGRAM',
    version: 1,
  };
  return {
    fetchLatest: async () => structuredClone(form),
    patch: async ({
      expectedVersion,
      ...values
    }: UpdateProgramFormRequestDto) => {
      if (expectedVersion !== form.version) {
        // 프록시를 거친 뒤 ApiError 가 들고 있는 모양
        throw Object.assign(new Error('충돌'), {
          status: 409,
          code: 'FORM_VERSION_CONFLICT',
        });
      }
      form = { ...form, ...values, dynamicForm: [], version: form.version + 1 };
      return { id: form.id, version: form.version };
    },
  };
};

const run = async () => {
  const server = createFakeServer();

  // A, B 가 같은 v1 을 연다
  const loadedByA = await server.fetchLatest();
  const loadedByB = await server.fetchLatest();

  // B 가 먼저 저장 → v2
  assert.deepEqual(
    await server.patch({
      ...body('B 제목'),
      expectedVersion: loadedByB.version,
    }),
    { id: 'form-1', version: 2 },
  );

  // A 가 낡은 v1 으로 저장 → FORM_VERSION_CONFLICT
  const conflict = await server
    .patch({ ...body('A 제목'), expectedVersion: loadedByA.version })
    .then(
      () => null,
      (error: unknown) => error,
    );
  assert.ok(isVersionConflict(conflict));
  assert.equal(isVersionConflict(new Error('다른 오류')), false);
  assert.equal(isVersionConflict(null), false);

  // 선택 1. 최신본 다시 불러오기: B 의 내용과 v2 를 받는다
  const latest = await server.fetchLatest();
  assert.equal(latest.title, 'B 제목');
  assert.equal(latest.version, 2);

  // 선택 2. 내 변경 유지한 채 재적용: 최신 version(v2)으로 A 의 값을 덮어써 v3
  assert.deepEqual(await reapplyMine(body('A 제목'), server), {
    id: 'form-1',
    version: 3,
  });
  assert.equal((await server.fetchLatest()).title, 'A 제목');

  // 재적용 직전에 또 누가 저장하면 다시 충돌한다(호출한 쪽이 모달을 유지)
  const racing = {
    fetchLatest: async () => {
      const snapshot = await server.fetchLatest();
      await server.patch({
        ...body('C 제목'),
        expectedVersion: snapshot.version,
      });
      return snapshot;
    },
    patch: server.patch,
  };
  await assert.rejects(reapplyMine(body('A 제목 다시'), racing), (error) =>
    isVersionConflict(error),
  );
  assert.equal((await server.fetchLatest()).title, 'C 제목');

  console.log('versionConflict.check: ok');
};

run();
