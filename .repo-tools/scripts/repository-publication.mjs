#!/usr/bin/env node
import { createCommandRunner } from './shared/command-runner.mjs';
import { RepositoryToolError } from './shared/repository-tool-error.mjs';
import { createGitClient } from './repository-publication/git-client.mjs';
import { createGhClient } from './repository-publication/gh-client.mjs';
import { runOpenOrUpdatePrFlow } from './repository-publication/open-or-update-pr-flow.mjs';
import { runMergePrFlow } from './repository-publication/merge-pr-flow.mjs';

function assertRuntime() {
  const major = Number(process.versions.node.split('.')[0]);
  if (!Number.isFinite(major) || major < 20) {
    throw new RepositoryToolError('NODE_VERSION_UNSUPPORTED', `Repository publication tooling requires Node >= 20; found ${process.versions.node}.`);
  }
}

async function main() {
  assertRuntime();
  const [mode, target, ...extra] = process.argv.slice(2);
  if (extra.length) throw new RepositoryToolError('INVALID_ARGUMENT', 'Unexpected extra arguments.');
  const runner = createCommandRunner();
  const git = createGitClient(runner);
  const gh = createGhClient(runner);
  let result;
  if (mode === 'pr-open-or-update' && !target) {
    result = await runOpenOrUpdatePrFlow({ git, gh });
  } else if (mode === 'pr-merge' && /^\d+$/.test(target || '')) {
    result = await runMergePrFlow({ git, gh, prNumber: Number(target) });
  } else {
    throw new RepositoryToolError(
      'INVALID_ARGUMENT',
      'Usage: repository-publication.mjs pr-open-or-update | repository-publication.mjs pr-merge <PR>'
    );
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error) => {
  const code = error instanceof RepositoryToolError ? error.code : 'UNEXPECTED_ERROR';
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${JSON.stringify({ error: code, message })}\n`);
  process.exitCode = 1;
});
