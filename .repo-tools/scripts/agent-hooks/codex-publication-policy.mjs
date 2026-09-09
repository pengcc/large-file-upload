const DIRECT_GIT = String.raw`git(?:\s+-C\s+\S+)?`;
const DIRECT_PUSH = new RegExp(String.raw`^${DIRECT_GIT}\s+push(?:\s|$)`);
const DIRECT_PR_MUTATION = /^gh\s+pr\s+(?:create|merge)(?:\s|$)/;
const RELEVANT_PUBLICATION = /(?:^|\s)(?:git(?:\s+-C\s+\S+)?\s+push|gh\s+pr\s+(?:create|merge))(?:\s|$)/;
const SHELL_COMPOSITION = /(?:&&|\|\||[;|<>\n\r])/;

function denial(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  };
}

export function classifyCodexShellCommand(command) {
  if (typeof command !== 'string') return { action: 'allow' };
  const normalized = command.trim();
  if (!normalized) return { action: 'allow' };
  if (SHELL_COMPOSITION.test(normalized) && RELEVANT_PUBLICATION.test(normalized)) {
    return { action: 'block-compound-publication' };
  }
  if (DIRECT_PUSH.test(normalized) || DIRECT_PR_MUTATION.test(normalized)) {
    return { action: 'block-direct-publication' };
  }
  return { action: 'allow' };
}

export function codexHookFailureResult(payload) {
  const command = payload?.tool_input?.command;
  const covered = classifyCodexShellCommand(command).action !== 'allow';
  return covered
    ? { exitCode: 2, message: 'Publication guard failed while evaluating a covered command; the command was blocked before effects.' }
    : { exitCode: 1, message: 'Publication guard failed for an unrelated command; no repository publication decision was made.' };
}

export function evaluateCodexPreToolUse({ payload }) {
  if (payload?.hook_event_name !== 'PreToolUse' || payload?.tool_name !== 'Bash') return null;
  const classification = classifyCodexShellCommand(payload.tool_input?.command);
  if (classification.action === 'allow') return null;
  if (classification.action === 'block-compound-publication') {
    return denial('Compound publication/merge commands are blocked. Use the maintained repository publication workflow as an isolated command.');
  }
  return denial('Direct git push / gh pr create / gh pr merge is blocked. Use the maintained open-or-update-pr or merge-pr Agent workflow.');
}
