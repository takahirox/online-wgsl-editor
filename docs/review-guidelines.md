# Review and Merge Guidelines

Apply these steps when reviewing human or AI contributions. Follow the
[development flow](development-flow.md), including its
[English collaboration-language convention](development-flow.md#collaboration-language).

## Review against the Issue

Read the source Issue, its completion criteria, the PR description, and the current
diff. Treat the Issue as the reference for the problem, expected outcome, and scope.
Check every requirement the PR claims to resolve. Do not approve a PR as closing an
Issue when required implementation work remains; an intentionally partial PR must
say so and leave the Issue open.

## Check scope and correctness

Prefer the smallest change that fully solves the Issue. Check for missing work and
unjustified additions, including unrelated refactoring, unnecessary abstractions,
speculative extensibility, new frameworks, dependencies, or configuration.

Verify that behavior matches the expected outcome, the change fits the existing
architecture, and affected documentation is accurate. For collaboration documents,
check consistency, Markdown/template syntax, links, and the English convention.

Review applicable interface changes against the [UI/UX principles](../README.md#uiux).

## Check pre-merge acceptance and post-merge verification

Verify that mandatory pre-merge criteria are achievable and verifiable before merge,
and that evidence supports their completion. Match validation to the changed files
and the [actual repository tooling](development-flow.md#2-implement-and-validate).
`npm test` is a failing placeholder, not an automated suite. Documentation-only
changes require appropriate syntax, link, whitespace, and consistency checks; they
do not require new runtime tests, browser interaction, or GPU/device validation.

Apply the [test and CI performance principles](development-flow.md#test-and-ci-performance-principles).
For new or expanded checks, review the additional defects covered, overlap with
existing coverage, and added execution and maintenance cost. Ask:

> Does this change provide sufficient confidence with the lightest appropriate
> validation, without redundant execution?

Check that the PR reports actual results, including failures, skipped checks, and
unperformed checks with reasons. Optional validation must remain distinct from
mandatory completion criteria. Human confirmation, physical-device testing, subjective
evaluation, or external approval should be mandatory only when necessary for the Issue,
with the reason and expected result stated.

Checks possible only after merge must not be prerequisites for pre-merge approval.
Record genuinely necessary post-merge verification separately, pending until performed;
otherwise state None. For a merge-triggered deployment, pre-merge code/configuration
checks do not prove publication or the newly published site works. This separation
does not waive implementation requirements or applicable pre-merge checks.

## Choose a review outcome

- **Agent-fixable findings:** Request changes with the specific missing requirement,
  correctness problem, unnecessary scope, or validation gap and its expected result.
  Let the agent revise the PR, then review the updated diff and relevant checks again.
- **Necessary human input:** State the specific question, why it blocks progress, and
  what answer or confirmation is needed. Use the workflow's wait path and wait for the
  answer before resuming the dependent review or merge. Report this as waiting for
  human input, separately from agent-fixable findings; do not repeatedly request code
  changes to obtain that answer. Continue independent review where useful.
- **Ready to merge:** Approve when the implementation is complete and correct, scope
  is justified, mandatory pre-merge checks are sufficient, and no blocking findings
  or necessary unanswered human questions remain. Record any required post-merge
  checks as pending; those checks do not block pre-merge approval.

## Merge and report

After review passes, merge through the authorized workflow into the PR's intended
base branch (normally `main`). If the PR changes after approval, review the updated
change and relevant validation before merging.

Report required post-merge verification separately and honestly. Keep it pending
until performed, then record actual results, failures, and any follow-up. Do not claim
deployment or publication succeeded based on pre-merge validation. No post-merge
verification is required for a templates/documentation-only Issue unless the source
Issue establishes a specific need.
