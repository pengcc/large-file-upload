import test from 'node:test';
import assert from 'node:assert/strict';
import { createGhClient } from './repository-publication/gh-client.mjs';
import { runMergePrFlow } from './repository-publication/merge-pr-flow.mjs';

async function expectCode(fn, code) {
  await assert.rejects(fn, (error) => error?.code === code);
}

function ghClientWithResult(result) {
  return createGhClient({
    run(command, args) {
      assert.equal(command, 'gh');
      assert.deepEqual(args.slice(0, 2), ['pr', 'checks']);
      return result;
    },
  }, '/repo');
}

test('gh required-check adapter preserves documented non-zero check-result states', async () => {
  const pending = [{ bucket: 'pending', name: 'ci', state: 'QUEUED' }];
  const failed = [{ bucket: 'fail', name: 'ci', state: 'FAILURE' }];

  assert.deepEqual(
    await ghClientWithResult({
      ok: false, status: 8, stdout: JSON.stringify(pending), stderr: '',
    }).requiredChecks('pengcc/large-file-upload', 9),
    pending
  );

  assert.deepEqual(
    await ghClientWithResult({
      ok: false, status: 1, stdout: JSON.stringify(failed), stderr: '',
    }).requiredChecks('pengcc/large-file-upload', 9),
    failed
  );

  await expectCode(
    () => ghClientWithResult({
      ok: false, status: 1, stdout: '', stderr: 'GraphQL: access denied',
    }).requiredChecks('pengcc/large-file-upload', 9),
    'CHECKS_READ_FAILED'
  );
});

function mergeFixture({ mergeResult = { ok: true, stdout: '', stderr: '' }, observeError = false } = {}) {
  const calls = [];
  const pr = {
    number: 9,
    url: 'https://github.com/pengcc/large-file-upload/pull/9',
    state: 'OPEN',
    baseRefName: 'main',
    headRefName: 'feature/x',
    headRefOid: 'abc123',
    isDraft: false,
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    reviewDecision: 'APPROVED',
    mergedAt: null,
  };
  const git = {
    repoRoot: async () => '/repo',
    originUrl: async () => 'https://github.com/pengcc/large-file-upload.git',
    assertOriginMatches: () => {},
  };
  const gh = {
    authReady: async () => true,
    repoInfo: async () => ({ repo: 'pengcc/large-file-upload', defaultBranch: 'main' }),
    allowSquashMerge: async () => true,
    requiredChecks: async () => [],
    viewPullRequest: async () => {
      if (observeError && calls.length > 0) {
        const error = new Error('transport unavailable during merge observation');
        error.code = 'PR_READ_FAILED';
        throw error;
      }
      return pr;
    },
    merge: async (repo, number, headSha) => {
      calls.push(['merge', repo, number, headSha]);
      return mergeResult;
    },
  };
  return { git, gh, calls };
}

test('post-merge observation failure after apparent success reports uncertain effect', async () => {
  const fixture = mergeFixture({ observeError: true });
  await expectCode(
    () => runMergePrFlow({ ...fixture, prNumber: 9, attempts: 2, sleep: async () => {}, intervalMs: 0 }),
    'MERGE_EFFECT_UNCERTAIN'
  );
  assert.deepEqual(fixture.calls, [['merge', 'pengcc/large-file-upload', 9, 'abc123']]);
});

test('post-merge observation failure after ambiguous command failure reports uncertain effect', async () => {
  const fixture = mergeFixture({
    observeError: true,
    mergeResult: { ok: false, stdout: '', stderr: 'network timeout' },
  });
  await expectCode(
    () => runMergePrFlow({ ...fixture, prNumber: 9, attempts: 2, sleep: async () => {}, intervalMs: 0 }),
    'MERGE_EFFECT_UNCERTAIN'
  );
  assert.deepEqual(fixture.calls, [['merge', 'pengcc/large-file-upload', 9, 'abc123']]);
});
