import { spawnSync } from 'node:child_process';

export function createCommandRunner() {
  return {
    run(command, args = [], { cwd, env = process.env } = {}) {
      const result = spawnSync(command, args, {
        cwd,
        env,
        encoding: 'utf8',
        shell: false,
      });
      return {
        ok: !result.error && result.status === 0,
        status: result.status,
        stdout: result.stdout || '',
        stderr: result.stderr || (result.error ? result.error.message : ''),
      };
    },
  };
}
