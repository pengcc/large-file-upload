import test from 'node:test';
import assert from 'node:assert/strict';
import { runOpenOrUpdatePrFlow } from './repository-publication/open-or-update-pr-flow.mjs';
import { runMergePrFlow } from './repository-publication/merge-pr-flow.mjs';
import { evaluateRequiredChecks } from './repository-publication/validation.mjs';

function openFixture(overrides = {}) {
  const calls = [];
  const state = {
    originUrl: 'https://github.com/pengcc/large-file-upload.git',
    branch: 'feature/x', clean: true, containsDefault: true, head: 'abc123',
    beforeRemote: '', afterRemote: 'abc123', candidates: [], createdCandidates: [{ number: 7 }],
    existingPr: null,
    pr: { number: 7, url: 'https://github.com/pengcc/large-file-upload/pull/7', state: 'OPEN', baseRefName: 'main', headRefName: 'feature/x', headRefOid: 'abc123' },
    ...overrides,
  };
  let listCount = 0;
  const git = {
    repoRoot: async () => '/repo',
    originUrl: async () => state.originUrl,
    branch: async () => state.branch,
    isClean: async () => state.clean,
    fetchOrigin: async () => { calls.push(['fetch']); },
    containsRemoteDefault: async () => state.containsDefault,
    headSha: async () => state.head,
    remoteHead: async () => (calls.some(([x]) => x === 'push') ? state.afterRemote : state.beforeRemote),
    pushExact: async (branch, sha) => { calls.push(['push', branch, sha]); },
    latestSubject: async () => 'feat: x',
    assertOriginMatches: (repo) => { assert.equal(repo, 'pengcc/large-file-upload'); },
  };
  const gh = {
    authReady: async () => state.authReady ?? true,
    repoInfo: async () => ({ repo: 'pengcc/large-file-upload', defaultBranch: 'main' }),
    listOpenPullRequests: async () => {
      listCount += 1;
      return listCount === 1 ? state.candidates : state.createdCandidates;
    },
    viewPullRequest: async () => state.existingPr || state.pr,
    createPullRequest: async (_repo, args) => { calls.push(['create', args]); return state.pr.url; },
  };
  return { git, gh, calls, state };
}

async function expectCode(fn, code) {
  await assert.rejects(fn, (error) => error?.code === code);
}

test('open-or-update blocks dirty worktree', async () => {
  const f = openFixture({ clean: false });
  await expectCode(() => runOpenOrUpdatePrFlow(f), 'DIRTY_WORKTREE');
  assert.equal(f.calls.some(([x]) => x === 'push'), false);
});

test('open-or-update blocks detached/default/stale branch', async () => {
  await expectCode(() => runOpenOrUpdatePrFlow(openFixture({ branch: '' })), 'DETACHED_HEAD');
  await expectCode(() => runOpenOrUpdatePrFlow(openFixture({ branch: 'main' })), 'DEFAULT_BRANCH_MUTATION_BLOCKED');
  await expectCode(() => runOpenOrUpdatePrFlow(openFixture({ containsDefault: false })), 'STALE_BRANCH');
});

test('open-or-update blocks missing GitHub capability and ambiguous PR', async () => {
  await expectCode(() => runOpenOrUpdatePrFlow(openFixture({ authReady: false })), 'GH_AUTH_FAILED');
  await expectCode(() => runOpenOrUpdatePrFlow(openFixture({ candidates: [{ number: 1 }, { number: 2 }] })), 'AMBIGUOUS_PR');
});

test('open-or-update creates one PR after exact non-force push and verifies head', async () => {
  const f = openFixture();
  const result = await runOpenOrUpdatePrFlow(f);
  assert.equal(result.status, 'created');
  assert.deepEqual(f.calls.find(([x]) => x === 'push'), ['push', 'feature/x', 'abc123']);
  assert.equal(f.calls.filter(([x]) => x === 'create').length, 1);
  assert.equal(result.headSha, 'abc123');
});

test('open-or-update updates existing PR without duplicate create', async () => {
  const pr = { number: 5, url: 'u', state: 'OPEN', baseRefName: 'main', headRefName: 'feature/x', headRefOid: 'abc123' };
  const f = openFixture({ candidates: [{ number: 5 }], existingPr: pr, beforeRemote: 'old' });
  const result = await runOpenOrUpdatePrFlow(f);
  assert.equal(result.status, 'updated');
  assert.equal(f.calls.some(([x]) => x === 'create'), false);
});

test('open-or-update reports unchanged when remote and PR already point to exact head', async () => {
  const pr = { number: 5, url: 'u', state: 'OPEN', baseRefName: 'main', headRefName: 'feature/x', headRefOid: 'abc123' };
  const f = openFixture({ candidates: [{ number: 5 }], existingPr: pr, beforeRemote: 'abc123' });
  const result = await runOpenOrUpdatePrFlow(f);
  assert.equal(result.status, 'unchanged');
});

test('open-or-update blocks branch/head drift before push', async () => {
  const f = openFixture();
  let branchCalls = 0;
  f.git.branch = async () => (++branchCalls === 1 ? 'feature/x' : 'feature/y');
  await expectCode(() => runOpenOrUpdatePrFlow(f), 'BRANCH_CONTEXT_DRIFT');
  assert.equal(f.calls.some(([x]) => x === 'push'), false);
});

test('open-or-update blocks remote head mismatch after push', async () => {
  const f = openFixture({ afterRemote: 'other' });
  await expectCode(() => runOpenOrUpdatePrFlow(f), 'REMOTE_HEAD_MISMATCH');
});

function mergeFixture(overrides = {}) {
  const calls = [];
  const basePr = {
    number: 9, url: 'u', state: 'OPEN', baseRefName: 'main', headRefName: 'feature/x', headRefOid: 'abc123',
    isDraft: false, mergeable: 'MERGEABLE', mergeStateStatus: 'CLEAN', reviewDecision: 'APPROVED', mergedAt: null,
  };
  const state = {
    prs: [basePr, basePr, { ...basePr, state: 'MERGED', mergedAt: '2026-09-09T10:00:00Z' }],
    checks: [], allowSquash: true, mergeResult: { ok: true, stdout: '', stderr: '' },
    authReady: true, ...overrides,
  };
  let prIndex = 0;
  const git = {
    repoRoot: async () => '/repo',
    originUrl: async () => 'https://github.com/pengcc/large-file-upload.git',
    assertOriginMatches: () => {},
  };
  const gh = {
    authReady: async () => state.authReady,
    repoInfo: async () => ({ repo: 'pengcc/large-file-upload', defaultBranch: 'main' }),
    allowSquashMerge: async () => state.allowSquash,
    viewPullRequest: async () => state.prs[Math.min(prIndex++, state.prs.length - 1)],
    requiredChecks: async () => state.checks,
    merge: async (repo, n, sha) => { calls.push(['merge', repo, n, sha]); return state.mergeResult; },
  };
  return { git, gh, calls, state };
}

test('required checks distinguish pending/fail/unknown', () => {
  assert.throws(() => evaluateRequiredChecks([{ bucket: 'pending', name: 'ci', state: 'QUEUED' }]), (e) => e.code === 'CHECKS_PENDING');
  assert.throws(() => evaluateRequiredChecks([{ bucket: 'fail', name: 'ci', state: 'FAILURE' }]), (e) => e.code === 'CHECKS_FAILED');
  assert.throws(() => evaluateRequiredChecks([{ bucket: 'mystery', name: 'ci', state: '?' }]), (e) => e.code === 'CHECKS_UNKNOWN');
  assert.doesNotThrow(() => evaluateRequiredChecks([{ bucket: 'pass', name: 'ci', state: 'SUCCESS' }]));
});

test('merge blocks invalid target, auth, squash setting, closed/draft/wrong-base/review/conflict/unknown', async () => {
  await expectCode(() => runMergePrFlow({ ...mergeFixture(), prNumber: 0 }), 'INVALID_PR');
  await expectCode(() => runMergePrFlow({ ...mergeFixture({ authReady: false }), prNumber: 9 }), 'GH_AUTH_FAILED');
  await expectCode(() => runMergePrFlow({ ...mergeFixture({ allowSquash: false }), prNumber: 9 }), 'MERGE_METHOD_UNAVAILABLE');
  for (const [patch, code] of [
    [{ state: 'CLOSED' }, 'PR_NOT_OPEN'],
    [{ isDraft: true }, 'PR_DRAFT'],
    [{ baseRefName: 'other' }, 'PR_BASE_MISMATCH'],
    [{ reviewDecision: 'CHANGES_REQUESTED' }, 'REVIEW_BLOCKED'],
    [{ mergeable: 'CONFLICTING' }, 'MERGE_CONFLICT'],
    [{ mergeable: 'UNKNOWN' }, 'MERGE_READINESS_UNKNOWN'],
    [{ mergeStateStatus: 'BLOCKED' }, 'MERGE_BLOCKED'],
  ]) {
    const pr = { ...mergeFixture().state.prs[0], ...patch };
    await expectCode(() => runMergePrFlow({ ...mergeFixture({ prs: [pr] }), prNumber: 9 }), code);
  }
});

test('merge blocks failed/pending required checks before mutation', async () => {
  for (const [bucket, code] of [['pending', 'CHECKS_PENDING'], ['fail', 'CHECKS_FAILED']]) {
    const f = mergeFixture({ checks: [{ bucket, name: 'ci', state: bucket }] });
    await expectCode(() => runMergePrFlow({ ...f, prNumber: 9 }), code);
    assert.equal(f.calls.length, 0);
  }
});

test('merge blocks head drift on final mutable-readiness reread', async () => {
  const first = mergeFixture().state.prs[0];
  const second = { ...first, headRefOid: 'newhead' };
  const f = mergeFixture({ prs: [first, second] });
  await expectCode(() => runMergePrFlow({ ...f, prNumber: 9 }), 'PR_HEAD_DRIFT');
  assert.equal(f.calls.length, 0);
});

test('merge uses captured head once and verifies remote merged state', async () => {
  const f = mergeFixture();
  const result = await runMergePrFlow({ ...f, prNumber: 9, sleep: async () => {}, intervalMs: 0 });
  assert.equal(result.status, 'verified merged');
  assert.deepEqual(f.calls, [['merge', 'pengcc/large-file-upload', 9, 'abc123']]);
});

test('ambiguous merge failure converges to verified merged without retry', async () => {
  const f = mergeFixture({ mergeResult: { ok: false, stderr: 'network timeout', stdout: '' } });
  const result = await runMergePrFlow({ ...f, prNumber: 9, sleep: async () => {}, intervalMs: 0 });
  assert.equal(result.status, 'verified merged');
  assert.equal(f.calls.length, 1);
});

test('ambiguous unresolved merge reports uncertain effect', async () => {
  const open = mergeFixture().state.prs[0];
  const f = mergeFixture({
    mergeResult: { ok: false, stderr: 'network timeout', stdout: '' },
    prs: [open, open, open, open, open, open, open, open],
  });
  await expectCode(() => runMergePrFlow({ ...f, prNumber: 9, attempts: 2, sleep: async () => {}, intervalMs: 0 }), 'MERGE_EFFECT_UNCERTAIN');
  assert.equal(f.calls.length, 1);
});

test('non-ambiguous merge rejection remains unmerged blocker', async () => {
  const open = mergeFixture().state.prs[0];
  const f = mergeFixture({
    mergeResult: { ok: false, stderr: 'GraphQL: merge blocked by repository rule', stdout: '' },
    prs: [open, open, open, open],
  });
  await expectCode(() => runMergePrFlow({ ...f, prNumber: 9, attempts: 1, sleep: async () => {}, intervalMs: 0 }), 'MERGE_REJECTED');
  assert.equal(f.calls.length, 1);
});
