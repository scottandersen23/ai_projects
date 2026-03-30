<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
  - Template Principle 1 -> I. Readability First
  - Template Principle 2 -> II. Simplicity Over Cleverness
  - Template Principle 3 -> III. Comments That Teach
  - Template Principle 4 -> IV. Newcomer-Friendly Defaults
  - Template Principle 5 -> V. Single-File Bias
- Added sections:
  - Additional Constraints
  - Development Workflow
- Removed sections: none
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ⚠ pending: .specify/templates/commands/*.md (directory not present in this repo)
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Confirm original adoption date if it predates this amendment.
-->

# Contractor Dashboard Constitution

## Core Principles

### I. Readability First

All production code MUST optimize for readability before micro-optimizations or stylistic
preferences. Names MUST be explicit, functions SHOULD be short and focused, and control flow
MUST remain easy to scan.

Rationale: This project is maintained by a mixed-experience team, so readability is the fastest
path to safe changes.

### II. Simplicity Over Cleverness

Implement the simplest solution that satisfies current requirements. Team members MUST avoid
abstractions that do not solve an active problem, and every layer or pattern introduced MUST
have a concrete, documented need.

Rationale: Simple code lowers maintenance cost and reduces onboarding friction.

### III. Comments That Teach

Comments MUST explain intent, constraints, and non-obvious decisions. Trivial comments that only
repeat code are discouraged. Complex logic blocks, edge-case handling, and integration boundaries
MUST include concise explanatory comments.

Rationale: Good comments help newer full-stack developers understand why code exists, not just
what it does.

### IV. Newcomer-Friendly Defaults

Features MUST be implemented so relative newcomers to full-stack development can follow them.
Code paths SHOULD be predictable, error handling MUST be explicit, and docs or in-file guidance
MUST be added when behavior is not immediately obvious.

Rationale: Newcomer-friendly structure increases team velocity and review quality.

### V. Single-File Bias

Prefer extending an existing file over creating new files when it preserves clarity and file size
remains practical. New files MUST be justified by separation of responsibility, testability, or
clear domain boundaries.

Rationale: A controlled file count keeps navigation simple and reduces architectural sprawl.

## Additional Constraints

- Every pull request MUST include a brief readability self-check in its description.
- Any newly introduced indirection (new service layer, helper module, or utility abstraction)
  MUST state why inline implementation was insufficient.
- File splits MUST happen only when a file becomes difficult to understand, difficult to test, or
  mixes unrelated responsibilities.

## Development Workflow

1. Start implementation in the most relevant existing file.
2. Add or update comments where intent would otherwise be unclear to a newcomer.
3. Validate that naming, structure, and flow are understandable without deep project history.
4. Split files only when justified by the constraints above, and document that reason in the plan
   or task notes.

## Governance

This constitution is the authoritative source for engineering practices in this repository.
Reviews, plans, specs, and tasks MUST demonstrate compliance.

Amendment process:

1. Propose a change with explicit rationale and impact on current templates.
2. Classify version impact using semantic versioning:
   - MAJOR: incompatible principle removals or redefinitions
   - MINOR: new principle or materially expanded guidance
   - PATCH: clarifications and wording-only refinements
3. Update dependent templates in the same change when applicable.

Compliance policy:

- Constitution checks are required in planning artifacts.
- Violations MUST be documented with a simpler rejected alternative.
- Periodic review of templates MUST ensure continued alignment with this constitution.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Confirm first adoption date. | **Last Amended**: 2026-03-27
