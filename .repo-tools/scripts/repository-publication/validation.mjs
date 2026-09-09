import { RepositoryToolError } from '../shared/repository-tool-error.mjs';

export function evaluateRequiredChecks(checks = []) {
  for (const check of checks) {
    const bucket = String(check?.bucket || '').toLowerCase();
    const name = String(check?.name || 'Unnamed required check');
    const state = String(check?.state || 'unknown');
    if (bucket === 'pass') continue;
    if (bucket === 'pending') {
      throw new RepositoryToolError('CHECKS_PENDING', `Required check "${name}" is pending (${state}).`);
    }
    if (['fail', 'cancel', 'skipping'].includes(bucket)) {
      throw new RepositoryToolError('CHECKS_FAILED', `Required check "${name}" did not pass (${state}).`);
    }
    throw new RepositoryToolError('CHECKS_UNKNOWN', `Required check "${name}" has unknown status (${bucket || 'missing'} / ${state}).`);
  }
}

export function assertPullRequestIdentity(pr, { defaultBranch, branch, headSha, requireOpen = true }) {
  if (requireOpen && pr.state !== 'OPEN') {
    throw new RepositoryToolError('PR_NOT_OPEN', `PR #${pr.number} is not open.`);
  }
  if (pr.baseRefName !== defaultBranch) {
    throw new RepositoryToolError('PR_BASE_MISMATCH', `PR #${pr.number} targets ${pr.baseRefName}, not ${defaultBranch}.`);
  }
  if (branch && pr.headRefName !== branch) {
    throw new RepositoryToolError('PR_HEAD_MISMATCH', `PR #${pr.number} head ${pr.headRefName} does not match ${branch}.`);
  }
  if (headSha && pr.headRefOid !== headSha) {
    throw new RepositoryToolError('PR_HEAD_DRIFT', `PR #${pr.number} head changed.`, {
      expectedHead: headSha,
      actualHead: pr.headRefOid,
    });
  }
}

export function assertMergeReady(pr, { defaultBranch, headSha } = {}) {
  assertPullRequestIdentity(pr, { defaultBranch, headSha, requireOpen: true });
  if (pr.isDraft) throw new RepositoryToolError('PR_DRAFT', `PR #${pr.number} is still a draft.`);
  if (pr.reviewDecision === 'CHANGES_REQUESTED') {
    throw new RepositoryToolError('REVIEW_BLOCKED', `PR #${pr.number} has requested changes.`);
  }
  if (pr.mergeable === 'CONFLICTING' || pr.mergeStateStatus === 'DIRTY') {
    throw new RepositoryToolError('MERGE_CONFLICT', `PR #${pr.number} has merge conflicts.`);
  }
  if (pr.mergeable === 'UNKNOWN' || pr.mergeStateStatus === 'UNKNOWN') {
    throw new RepositoryToolError('MERGE_READINESS_UNKNOWN', `GitHub has not resolved merge readiness for PR #${pr.number}.`);
  }
  if (pr.mergeStateStatus === 'BLOCKED') {
    throw new RepositoryToolError('MERGE_BLOCKED', `GitHub reports PR #${pr.number} as blocked.`);
  }
}

export function isAmbiguousMergeFailure(result) {
  const text = `${result?.stderr || ''} ${result?.stdout || ''}`.toLowerCase();
  return /timeout|timed out|connection|network|eof|tls|socket|502|503|504|temporar/.test(text);
}
