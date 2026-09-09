import { RepositoryToolError } from '../shared/repository-tool-error.mjs';
import { assertMergeReady, evaluateRequiredChecks, isAmbiguousMergeFailure } from './validation.mjs';

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readReady({ gh, repo, prNumber, defaultBranch, expectedHead = '' }) {
  const pr = await gh.viewPullRequest(repo, prNumber);
  assertMergeReady(pr, { defaultBranch, headSha: expectedHead || undefined });
  evaluateRequiredChecks(await gh.requiredChecks(repo, prNumber));
  return pr;
}

async function observeMerged({ gh, repo, prNumber, expectedHead, attempts, intervalMs, sleep }) {
  let last = null;
  for (let i = 0; i < attempts; i += 1) {
    last = await gh.viewPullRequest(repo, prNumber);
    if (last.state === 'MERGED' || last.mergedAt) {
      if (last.headRefOid !== expectedHead) {
        throw new RepositoryToolError('PR_HEAD_DRIFT', `Merged PR #${prNumber} reports an unexpected head.`);
      }
      return last;
    }
    if (i + 1 < attempts) await sleep(intervalMs);
  }
  return last;
}

export async function runMergePrFlow({ gh, git, prNumber, sleep = defaultSleep, attempts = 6, intervalMs = 1000 }) {
  if (!Number.isInteger(prNumber) || prNumber < 1) {
    throw new RepositoryToolError('INVALID_PR', 'pr-merge requires a positive numeric PR number.');
  }
  await git.repoRoot();
  const originUrl = await git.originUrl();
  if (!(await gh.authReady())) throw new RepositoryToolError('GH_AUTH_FAILED', 'GitHub CLI authentication/capability is unavailable.');
  const { repo, defaultBranch } = await gh.repoInfo();
  git.assertOriginMatches(repo, originUrl);
  if (!(await gh.allowSquashMerge(repo))) {
    throw new RepositoryToolError('MERGE_METHOD_UNAVAILABLE', 'Repository settings do not currently permit squash merge.');
  }

  const first = await readReady({ gh, repo, prNumber, defaultBranch });
  const expectedHead = first.headRefOid;
  await readReady({ gh, repo, prNumber, defaultBranch, expectedHead });

  const mergeResult = await gh.merge(repo, prNumber, expectedHead);
  const observed = await observeMerged({ gh, repo, prNumber, expectedHead, attempts, intervalMs, sleep });
  if (observed?.state === 'MERGED' || observed?.mergedAt) {
    return {
      status: 'verified merged',
      repository: repo,
      prNumber,
      baseBranch: defaultBranch,
      headSha: expectedHead,
      mergedAt: observed.mergedAt || null,
    };
  }

  if (!mergeResult.ok) {
    if (isAmbiguousMergeFailure(mergeResult)) {
      throw new RepositoryToolError('MERGE_EFFECT_UNCERTAIN', `Merge command failed ambiguously and PR #${prNumber} was not verified merged.`, {
        headSha: expectedHead,
      });
    }
    throw new RepositoryToolError('MERGE_REJECTED', `GitHub rejected merge for PR #${prNumber}: ${String(mergeResult.stderr || mergeResult.stdout || '').trim()}`);
  }

  throw new RepositoryToolError('MERGE_EFFECT_UNCERTAIN', `Merge command returned success but PR #${prNumber} was not verified merged.`, {
    headSha: expectedHead,
  });
}
