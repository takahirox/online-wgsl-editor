# Development Flow

This is the default collaboration flow for `online-wgsl-editor`, including AI
contributors. The repository's default branch is `main`.

## Collaboration language

Use **English** for newly authored templates, development/review/merge documentation,
AI instructions, Issue and PR titles and bodies, review comments, and commit messages.
This convention does not require translating historical content or changing product
localization.

## 1. Start with an Issue

Use the [Issue template](../.github/ISSUE_TEMPLATE/issue.md) to describe the problem,
expected outcome, relevant context, reproduction steps where applicable, and concrete
completion criteria. An assignee or owner field is not required.

Treat the source Issue as the scope of the work. Clarify genuinely blocking ambiguity
before implementing the affected part; do not invent requirements.

Default to completion criteria an AI agent can execute and verify. Require human
confirmation, physical-device testing, subjective evaluation, or external approval
only when necessary for the actual Issue. Explain why and what result is expected.
Separate optional validation from mandatory completion criteria.

Mandatory pre-merge acceptance must be achievable and verifiable before merge.
Checks possible only after merge must not be prerequisites for pre-merge approval.
Record genuinely necessary post-merge work separately; state None when none is needed.
For example, a merge-triggered deployment can only be verified after merge, while
applicable code/configuration checks belong before merge. This distinction preserves
all implementation requirements and applicable pre-merge checks.

## 2. Implement and validate

Choose the smallest change that fully addresses the Issue. Preserve useful existing
instructions and follow the existing code structure. Avoid unrelated refactoring,
speculative frameworks, dependency changes, or configuration changes.

The editor uses `index.html` and JavaScript in `src/`. The existing README documents
local setup. The scripts in [package.json](../package.json) are:

| Command | Purpose |
| --- | --- |
| `npm run start` | Runs `servez -p 8080` to serve the editor locally. |
| `npm test` | Prints `Error: no test specified` and exits with status 1; it is a placeholder. |

There are no configured build, lint, or automated test suites, and no checked-in CI
workflows. Do not invent commands or present the placeholder test as a passing suite.
Apply the [test and CI performance principles](#test-and-ci-performance-principles)
to existing validation and future checks. Select checks based on the files changed
and the actual tooling available:

- For templates/documentation only, check Markdown syntax, Issue template YAML front
  matter, local links and heading anchors, whitespace with `git diff --check`, and
  consistency across the templates, README, AI entry point, and guidance. Use available
  Markdown tooling or describe the manual checks performed. No new runtime tests,
  routine manual approval, browser interaction, GPU/physical-device checks,
  heavyweight-model downloads, or deployment gates are required.
- For editor behavior changes, choose relevant code checks and, when necessary to
  verify the Issue, exercise the affected behavior using the local server and a
  WebGPU-capable browser. Record the environment and actual results. Human or physical
  device testing is required only when justified by the Issue.

Report failures, skipped checks, and unperformed checks accurately, with reasons.
Do not treat optional checks as mandatory or claim a check passed without performing it.

### Test and CI performance principles

**Detect the required failures at the lightest appropriate layer, without redundant
execution.** Preserve required behavior, regression confidence, and meaningful
integration coverage when moving or reducing checks. These principles apply to
current manual validation and any future tests or CI; they do not introduce tooling
or a new merge gate.

1. **Prefer the lightest meaningful layer.** When adding tests, cover math, geometry
   calculations, branches, and broad input combinations with fast unit/component
   checks where possible. Use browser/WebGPU checks for shader compilation,
   rendering, editor controls, and feedback that require that environment. Each test
   should catch a concrete defect rather than mirror its implementation.
2. **Choose combinations deliberately.** Cover distinct paths with representative
   shaders, geometry, camera, rotation, and browser cases. Avoid automatically
   multiplying every option; use exhaustive combinations when their interactions
   require them. Retain required regressions and integration assertions when
   redistributing coverage.
3. **Match validation to the change.** Use the documentation checks above for prose;
   exercise affected controls and feedback for UI changes, and relevant calculations,
   compilation, and rendering for core/runtime changes. For future CI/build changes,
   check the affected configuration, triggers, and outputs. Give fast feedback, full
   regression validation, and deployment/publication distinct responsibilities and
   appropriate triggers. Keep applicable mandatory checks before merge, optional
   validation explicit, and genuinely post-merge-only work recorded separately as
   described in [Issue acceptance](#1-start-with-an-issue).
4. **Reuse work and avoid duplicate execution.** As automation is added, reuse
   expensive setup such as downloads, fixtures, and build outputs with appropriate
   cache keys and isolation. Avoid equivalent push/PR runs for the same revision;
   cancel superseded runs when safe while preserving necessary deployment ordering.
   Parallelize independent work based on measured resource use, rather than assuming
   more workers improve feedback time.
5. **Review coverage and cost together.** For added or expanded checks, identify the
   additional defect detected, whether existing coverage already supplies that
   assurance, and the execution and maintenance cost. Watch repeated fresh
   browser/WebGPU/compiler setup, large fixtures, long rendering loops, and growth
   from multiplying case combinations.
6. **Maintain an execution-time budget.** No measured normal-CI baseline or target
   is recorded here. Establish one from actual evidence during future test/CI
   performance work, monitor growth, and investigate work exceeding the target.
   Distinguish elapsed feedback time, total runner/computation time, and queue time.
   Revisit validation structure and duplication while retaining meaningful assertions
   and required coverage; this documentation change requires no benchmark or universal
   time limit.

## 3. Create a Pull Request for the Issue

Target `main` unless the task specifies another base branch. Use the
[PR template](../.github/pull_request_template.md) to explain the problem, resulting
behavior, focused changes, related Issues, and validation actually performed.

Use a concise English commit message describing what changed and why, and reference
the source Issue. Use and preserve `Closes #N` when the PR fully implements the Issue
and applicable mandatory pre-merge checks are satisfied. If implementation is
intentionally partial, describe the remaining scope and leave the parent Issue open
without an automatic closing reference. Pending post-merge-only verification does
not make an otherwise complete implementation partial. Record completed pre-merge
validation separately from required post-merge checks, which remain pending until
performed.

## 4. Review and revise as needed

Every PR should be reviewed before merge using the
[review and merge guidelines](review-guidelines.md). Review completeness against the
source Issue, correctness, unnecessary scope, and appropriate validation.

Request fixes for agent-fixable findings, revise the PR, and review the updated change
again. If genuinely necessary human input is missing, record the specific question
and use the workflow's wait path until an answer arrives. Distinguish this state from
fixable code findings; do not repeatedly request code fixes for missing human input.

## 5. Merge

Approve and merge through the authorized workflow when the implementation and
mandatory pre-merge checks are sufficient and no blocking review findings or necessary
unanswered human questions remain. Required repository protections, mandatory
pre-merge tests, and genuinely necessary pre-merge human acceptance remain blockers
until satisfied. Checks possible only after merge do not block pre-merge approval
when recorded separately. After successful merge, close the original Issue, then
perform any required post-merge verification.

## 6. Perform required post-merge verification, if any

Perform only the post-merge checks genuinely required by the actual change and
recorded in the Issue. Templates/documentation-only changes ordinarily require none.
Record evidence in the merged PR, closed Issue, or a linked validation report,
identifying the checked revision, environment, checks, and actual results. Report
unperformed, pending, or environment-blocked checks honestly, with reasons; closing
the Issue does not claim they passed. Pre-merge evidence does not prove deployment
or publication succeeded, and an unavailable test environment alone is not evidence
of a product defect.

If verification finds an actual defect, first check for an existing equivalent
Issue. Link that Issue or create a new one with reproduction steps, affected revision,
expected and actual behavior, and links to the original Issue and PR. Do not keep
or reopen the original Issue solely for post-merge follow-up.

This lifecycle supersedes older instructions to keep an implemented Issue open
solely for post-merge verification; preserve historical test outcomes and evidence
without rewriting them. In particular, ProjectWeave publication adds `Closes #N`:
review must not request removing it, keeping the source Issue open, or withholding
approval solely because post-merge-only verification is pending. Doing so makes
review and publication undo each other in a Review → Fix → Publish → Review loop.

The flow is Issue → implementation → PR → review → revision as needed → merge,
close the original Issue → post-merge verification only when required → linked
follow-up Issue for any discovered defect.
