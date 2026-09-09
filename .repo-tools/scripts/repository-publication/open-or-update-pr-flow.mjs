import { RepositoryToolError } from '../shared/repository-tool-error.mjs';
import { assertFeatureBranch } from './branch-safety.mjs';
import { assertPullRequestIdentity } from './validation.mjs';

export async function runOpenOrUpdatePrFlow({ git, gh }) {
  await git.repoRoot();
  const originUrl = await git.originUrl();
  if (!(await gh.authReady())) {
    throw new RepositoryToolError('GH_AUTH_FAILED', 'GitHub CLI authentication/capability is unavailable.');
  }
  const { repo, defaultBranch } = await gh.repoInfo();
  git.assertOriginMatches(repo, originUrl);

  const branch = await git.branch();
  assertFeatureBranch(branch, defaultBranch);
  if (!(await git.isClean())) {
    throw new RepositoryToolError('DIRTY_WORKTREE', 'PR publication requires a clean committed feature branch.');
  }

  await git.fetchOrigin();
  if (!(await git.containsRemoteDefault(defaultBranch))) {
    throw new RepositoryToolError('STALE_BRANCH', `HEAD does not contain current origin/${defaultBranch}.`);
  }

  const headSha = await git.headSha();
  const beforeRemoteHead = await git.remoteHead(branch);
  const candidates = await gh.listOpenPullRequests(repo, branch);
  if (candidates.length > 1) {
    throw new RepositoryToolError('AMBIGUOUS_PR', `More than one open PR exists for ${branch}.`);
  }
  const existing = candidates[0] ? await gh.viewPullRequest(repo, candidates[0].number) : null;
  if (existing) assertPullRequestIdentity(existing, { defaultBranch, branch, requireOpen: true });

  const currentBranch = await git.branch();
  const currentHead = await git.headSha();
  if (currentBranch !== branch || currentHead !== headSha || !(await git.isClean())) {
    throw new RepositoryToolError(
      'BRANCH_CONTEXT_DRIFT',
      'Branch, HEAD, or worktree changed after publication preflight. No push was attempted.'
    );
  }

  await git.pushExact(branch, headSha);
  const remoteHead = await git.remoteHead(branch);
  if (remoteHead !== headSha) {
    throw new RepositoryToolError('REMOTE_HEAD_MISMATCH', `Remote ${branch} does not match the captured local HEAD.`, {
      expectedHead: headSha,
      actualHead: remoteHead,
    });
  }

  let action;
  let pr;
  if (existing) {
    action = beforeRemoteHead === headSha ? 'unchanged' : 'updated';
    pr = await gh.viewPullRequest(repo, existing.number);
  } else {
    const title = (await git.latestSubject()) || `Review ${branch}`;
    await gh.createPullRequest(repo, {
      base: defaultBranch,
      head: branch,
      title,
      body: `Review-ready publication for \`${branch}\`.`,
    });
    const created = await gh.listOpenPullRequests(repo, branch);
    if (created.length !== 1) {
      throw new RepositoryToolError('PR_VERIFICATION_FAILED', `Expected exactly one open PR for ${branch} after creation.`);
    }
    action = 'created';
    pr = await gh.viewPullRequest(repo, created[0].number);
  }

  assertPullRequestIdentity(pr, { defaultBranch, branch, headSha, requireOpen: true });
  return {
    status: action,
    repository: repo,
    prNumber: pr.number,
    prUrl: pr.url,
    baseBranch: defaultBranch,
    headBranch: branch,
    headSha,
  };
}
