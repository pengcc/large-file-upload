import { commandFailure, RepositoryToolError } from '../shared/repository-tool-error.mjs';

function parseJson(result, code, context) {
  if (!result.ok) throw commandFailure(code, context, result);
  try {
    return JSON.parse(result.stdout || 'null');
  } catch {
    throw new RepositoryToolError(code, `${context}: invalid JSON output`);
  }
}

export function createGhClient(commandRunner, cwd = process.cwd()) {
  const run = (args) => commandRunner.run('gh', args, { cwd });
  return {
    async authReady() {
      return run(['auth', 'status']).ok;
    },
    async repoInfo() {
      const result = run(['repo', 'view', '--json', 'nameWithOwner,defaultBranchRef']);
      const data = parseJson(result, 'GH_CAPABILITY_FAILED', 'Could not resolve GitHub repository');
      return {
        repo: data.nameWithOwner,
        defaultBranch: data.defaultBranchRef?.name || 'main',
      };
    },
    async allowSquashMerge(repo) {
      const data = parseJson(
        run(['api', `repos/${repo}`]),
        'GH_CAPABILITY_FAILED',
        'Could not read repository merge settings'
      );
      return data.allow_squash_merge === true;
    },
    async listOpenPullRequests(repo, branch) {
      return parseJson(
        run(['pr', 'list', '--repo', repo, '--state', 'open', '--head', branch, '--json', 'number']),
        'PR_READ_FAILED',
        `Could not list pull requests for ${branch}`
      );
    },
    async viewPullRequest(repo, ref) {
      return parseJson(
        run([
          'pr', 'view', String(ref), '--repo', repo, '--json',
          'number,url,state,baseRefName,headRefName,isDraft,mergeable,mergeStateStatus,headRefOid,mergedAt,reviewDecision,title',
        ]),
        'PR_READ_FAILED',
        `Could not read pull request ${ref}`
      );
    },
    async createPullRequest(repo, { base, head, title, body }) {
      const result = run(['pr', 'create', '--repo', repo, '--base', base, '--head', head, '--title', title, '--body', body]);
      if (!result.ok) throw commandFailure('PR_CREATE_FAILED', 'Could not create pull request', result);
      return result.stdout.trim();
    },
    async requiredChecks(repo, prNumber) {
      const result = run([
        'pr', 'checks', String(prNumber), '--repo', repo, '--required', '--json', 'bucket,name,state',
      ]);
      const stderr = result.stderr.toLowerCase();
      if (!result.ok && (stderr.includes('no required checks') || stderr.includes('no checks reported'))) return [];
      return parseJson(result, 'CHECKS_READ_FAILED', `Could not verify required checks for PR #${prNumber}`);
    },
    async merge(repo, prNumber, headSha) {
      return run(['pr', 'merge', String(prNumber), '--repo', repo, '--squash', '--match-head-commit', headSha]);
    },
  };
}
