# Publishable Change Handoff

Use this reference when a completed validated delivery is committed on a non-default feature branch and publication is the next possible external action.

Publication is not implied by implementation completion. Preserve the user's authorization boundary:

- when push + PR creation/update is explicitly authorized, route to `open-or-update-pr`;
- otherwise report that the clean committed delivery is ready for publication and provide the maintained command only as the repository-owned execution surface, not as authorization to run it;
- never suggest direct `git push`, `gh pr create`, or `gh pr merge` as an Agent shortcut;
- immediate merge always routes separately to `merge-pr` and requires exact-PR explicit authority.

Maintained repository commands:

```bash
node .repo-tools/scripts/repository-publication.mjs pr-open-or-update
node .repo-tools/scripts/repository-publication.mjs pr-merge <PR>
```

The publication owner pushes existing commits only. Dirty/uncommitted work returns to the implementation owner. Application validation remains owned by the implementation contract; publication does not manufacture a package-manager or runtime validation command.
