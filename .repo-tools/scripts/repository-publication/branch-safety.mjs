import { RepositoryToolError } from '../shared/repository-tool-error.mjs';

export function isDefaultBranch(branch, defaultBranch) {
  return branch === defaultBranch || branch === 'main' || branch === 'master';
}

export function assertFeatureBranch(branch, defaultBranch) {
  if (!branch) {
    throw new RepositoryToolError('DETACHED_HEAD', 'Publication requires an attached feature branch.');
  }
  if (isDefaultBranch(branch, defaultBranch)) {
    throw new RepositoryToolError(
      'DEFAULT_BRANCH_MUTATION_BLOCKED',
      `Publication from default branch ${branch} is blocked.`
    );
  }
}
