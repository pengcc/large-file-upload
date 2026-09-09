import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyCodexShellCommand,
  codexHookFailureResult,
  evaluateCodexPreToolUse,
} from './codex-publication-policy.mjs';

test('blocks direct and compound publication bypasses', () => {
  assert.equal(classifyCodexShellCommand('git push origin x').action, 'block-direct-publication');
  assert.equal(classifyCodexShellCommand('git -C /repo push origin x').action, 'block-direct-publication');
  assert.equal(classifyCodexShellCommand('gh pr create --fill').action, 'block-direct-publication');
  assert.equal(classifyCodexShellCommand('gh pr merge 2').action, 'block-direct-publication');
  assert.equal(classifyCodexShellCommand('echo ok && git push origin x').action, 'block-compound-publication');
});

test('allows maintained Node commands and unrelated bash', () => {
  assert.equal(classifyCodexShellCommand('node .repo-tools/scripts/repository-publication.mjs pr-open-or-update').action, 'allow');
  assert.equal(classifyCodexShellCommand('node .repo-tools/scripts/repository-publication.mjs pr-merge 2').action, 'allow');
  assert.equal(classifyCodexShellCommand('git status --short').action, 'allow');
  assert.equal(classifyCodexShellCommand('node --test').action, 'allow');
});

test('PreToolUse emits denial only for covered effects', () => {
  const denied = evaluateCodexPreToolUse({ payload: { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'git push origin x' } } });
  assert.equal(denied.hookSpecificOutput.permissionDecision, 'deny');
  assert.equal(evaluateCodexPreToolUse({ payload: { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'git status' } } }), null);
});

test('hook failure fails closed only for covered publication', () => {
  assert.equal(codexHookFailureResult({ tool_input: { command: 'gh pr merge 2' } }).exitCode, 2);
  assert.equal(codexHookFailureResult({ tool_input: { command: 'git status' } }).exitCode, 1);
});
