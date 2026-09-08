# Implementation Review Route

Read when reviewing a complete delivered implementation or remediation against its full governing
authority and exact current target.

```txt
Primary role: Implementation Reviewer
Supporting roles: Code Reviewer, Acceptance Reviewer, Validation / Test Designer, Documentation Reviewer, domain reviewers as needed
Workflow: implementation-review with an optional bounded code-review lens
Mode: complete review | remediation re-review
Maturity expectation: evidence-based complete-result, workflow, risk, and implementation-quality judgment
Technical specialist skill: no technology-specific skill assumed; use repo facts and docs-first-research when needed
Quality rule: engineering-quality-principles applies
```

Keep narrower routes narrow:

- explicit acceptance criteria or delivery acceptance only -> `acceptance-review`;
- concrete code, PR, diff, or quality review only -> `code-review`;
- proposed-plan readiness -> the neutral Plan Review owned by `plan-with-context`; and
- complete delivered implementation or remediation -> `implementation-review`.
