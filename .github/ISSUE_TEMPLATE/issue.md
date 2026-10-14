---
name: Issue
about: Report a problem or propose a change
title: ""
labels: ""
---

<!-- Write the title and body in English. Follow the development guidance:
https://github.com/takahirox/online-wgsl-editor/blob/main/docs/development-flow.md -->

## Problem

Describe the problem and who or what it affects.

## Expected outcome

Describe what should be true when the Issue is resolved.

## Context and reproduction

Add relevant context, examples, logs, or related Issues. For a reproducible bug,
include steps, expected and actual results, and relevant browser/WebGPU details.
Omit reproduction steps when they do not apply.

## Pre-merge acceptance

List concrete mandatory criteria achievable and verifiable before merge.
Default to criteria an AI agent can execute and verify. Require human confirmation,
physical-device testing, subjective evaluation, or external approval only when
necessary for this Issue; explain why and what result is expected.

Checks possible only after merge, such as merge-triggered deployment or published-site
verification, must not be prerequisites for pre-merge approval. Choose checks that
fit the changed files and available tooling; documentation-only changes do not
require browser or GPU/device validation.

## Optional validation

List useful additional checks that are not required for completion, or state None.

## Required post-merge verification

State None unless this Issue genuinely requires checks possible only after merge.
When required, describe the check and expected result separately from pre-merge
acceptance. Report it as pending until performed; pre-merge validation does not
prove deployment or publication succeeded. See the
[review guidance](https://github.com/takahirox/online-wgsl-editor/blob/main/docs/review-guidelines.md#check-pre-merge-acceptance-and-post-merge-verification).
