import {
  codexHookFailureResult,
  evaluateCodexPreToolUse,
} from '../../.repo-tools/scripts/agent-hooks/codex-publication-policy.mjs';

let payload;
async function main() {
  process.stdin.setEncoding('utf8');
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  payload = JSON.parse(raw);
  const output = evaluateCodexPreToolUse({ payload });
  if (output) process.stdout.write(`${JSON.stringify(output)}\n`);
}

main().catch(() => {
  const failure = codexHookFailureResult(payload);
  process.stderr.write(`${failure.message}\n`);
  process.exitCode = failure.exitCode;
});
