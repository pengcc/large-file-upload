export class RepositoryToolError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'RepositoryToolError';
    this.code = code;
    this.details = details;
  }
}

export function commandFailure(code, context, result) {
  const stderr = String(result?.stderr || '').trim();
  const stdout = String(result?.stdout || '').trim();
  const detail = stderr || stdout || `exit ${result?.status ?? 'unknown'}`;
  return new RepositoryToolError(code, `${context}: ${detail}`, {
    status: result?.status ?? null,
  });
}
