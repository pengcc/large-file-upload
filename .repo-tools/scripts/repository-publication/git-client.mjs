import { commandFailure, RepositoryToolError } from '../shared/repository-tool-error.mjs';

function requireOk(result, code, context) {
  if (!result.ok) throw commandFailure(code, context, result);
  return result.stdout.trim();
}

export function repoFromOriginUrl(url) {
  const value = String(url || '').trim();
  const https = value.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (https) return `${https[1]}/${https[2]}`;
  const ssh = value.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (ssh) return `${ssh[1]}/${ssh[2]}`;
  return null;
}

export function createGitClient(commandRunner, cwd = process.cwd()) {
  const run = (args) => commandRunner.run('git', args, { cwd });
  return {
    async repoRoot() {
      return requireOk(run(['rev-parse', '--show-toplevel']), 'GIT_PRECHECK_FAILED', 'Could not resolve repository root');
    },
    async originUrl() {
      return requireOk(run(['remote', 'get-url', 'origin']), 'GIT_PRECHECK_FAILED', 'Could not resolve origin');
    },
    async branch() {
      const result = run(['symbolic-ref', '--quiet', '--short', 'HEAD']);
      if (!result.ok) return '';
      return result.stdout.trim();
    },
    async isClean() {
      return requireOk(run(['status', '--porcelain']), 'GIT_PRECHECK_FAILED', 'Could not inspect worktree') === '';
    },
    async headSha() {
      return requireOk(run(['rev-parse', 'HEAD']), 'GIT_PRECHECK_FAILED', 'Could not resolve HEAD');
    },
    async latestSubject() {
      return requireOk(run(['log', '-1', '--pretty=%s']), 'GIT_PRECHECK_FAILED', 'Could not read latest commit subject');
    },
    async fetchOrigin() {
      requireOk(run(['fetch', '--prune', 'origin']), 'REMOTE_READ_FAILED', 'Could not fetch origin');
    },
    async containsRemoteDefault(defaultBranch) {
      const result = run(['merge-base', '--is-ancestor', `origin/${defaultBranch}`, 'HEAD']);
      if (result.status === 0) return true;
      if (result.status === 1) return false;
      throw commandFailure('GIT_PRECHECK_FAILED', `Could not compare origin/${defaultBranch} with HEAD`, result);
    },
    async remoteHead(branch) {
      const out = requireOk(
        run(['ls-remote', '--heads', 'origin', `refs/heads/${branch}`]),
        'REMOTE_READ_FAILED',
        `Could not read remote head ${branch}`
      );
      return out ? out.split(/\s+/)[0] : '';
    },
    async pushExact(branch, headSha) {
      const result = run(['push', 'origin', `${headSha}:refs/heads/${branch}`]);
      if (!result.ok) throw commandFailure('PUSH_FAILED', `Could not push ${branch}`, result);
    },
    assertOriginMatches(repo, originUrl) {
      const parsed = repoFromOriginUrl(originUrl);
      if (!parsed || parsed.toLowerCase() !== String(repo).toLowerCase()) {
        throw new RepositoryToolError('REPOSITORY_MISMATCH', 'Git origin does not match the GitHub repository resolved by gh.', {
          origin: parsed || originUrl,
          repository: repo,
        });
      }
    },
  };
}
