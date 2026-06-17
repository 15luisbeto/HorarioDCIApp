# Skill Registry — HorarioDCIApp

Detected: 2026-06-17  
Project: `horariodciapp`  
Mode: hybrid SDD initialization

## Resolution

- Project skill directories scanned: `skills/`, `.opencode/skills/`, `.claude/skills/`, `.gemini/skills/`, `.cursor/skills/`, `.github/skills/`, `.codex/skills/`, `.qwen/skills/`, `.kiro/skills/`, `.openclaw/skills/`, `.pi/skills/`, `.agent/skills/`, `.agents/skills/`, `.atl/skills/`.
- Project skills found: none.
- User skill source used: `/home/luis/.config/opencode/skills/`.
- Excluded by SDD init convention: `sdd-*`, `_shared`, `skill-registry`.
- Project convention files found: none of `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, or `copilot-instructions.md` in the project root.

## Applicable Skills

### branch-pr

- Trigger: creating, opening, or preparing PRs for review.
- Path: `/home/luis/.config/opencode/skills/branch-pr/SKILL.md`
- Every PR must link an approved issue and include exactly one `type:*` label.
- Use branch names matching `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)/[a-z0-9._-]+$`.
- Use Conventional Commits and never include AI attribution trailers.
- PR bodies must include linked issue, type, summary, changes table, test plan, and checklist.

### chained-pr

- Trigger: PRs over 400 lines, stacked PRs, review slices.
- Path: `/home/luis/.config/opencode/skills/chained-pr/SKILL.md`
- Split PRs over 400 changed lines unless a maintainer explicitly accepts `size:exception`.
- Keep each PR reviewable in about 60 minutes or less.
- Use one deliverable work unit per PR and keep tests/docs with the verified unit.
- Do not mix chain strategies after a strategy is chosen.

### cognitive-doc-design

- Trigger: guides, READMEs, RFCs, onboarding, architecture, or review-facing docs.
- Path: `/home/luis/.config/opencode/skills/cognitive-doc-design/SKILL.md`
- Lead with the answer, then provide context.
- Prefer tables, checklists, examples, and templates over dense prose.
- Use progressive disclosure and explicit signposting.
- Design review docs so reviewers can verify intent without reconstructing the whole story.

### comment-writer

- Trigger: PR feedback, issue replies, reviews, Slack messages, or GitHub comments.
- Path: `/home/luis/.config/opencode/skills/comment-writer/SKILL.md`
- Start with the actionable point.
- Keep comments warm, direct, and short.
- Explain why when requesting a change.
- Match the thread/user language.

### go-testing

- Trigger: Go tests, coverage, Bubbletea teatest, golden files.
- Path: `/home/luis/.config/opencode/skills/go-testing/SKILL.md`
- Use only for Go testing contexts; not directly applicable to this Expo/TypeScript app.
- Prefer behavior-focused, table-driven tests when Go exists.
- Use `t.TempDir()` for filesystem tests and deterministic golden files.

### issue-creation

- Trigger: creating GitHub issues, bug reports, or feature requests.
- Path: `/home/luis/.config/opencode/skills/issue-creation/SKILL.md`
- Search for duplicates before creating issues.
- Use issue templates and fill required fields.
- New issues start as `status:needs-review`; PRs require `status:approved`.
- Questions belong in discussions, not issues.

### judgment-day

- Trigger: judgment day, dual review, adversarial review, juzgar.
- Path: `/home/luis/.config/opencode/skills/judgment-day/SKILL.md`
- Resolve project skills before judging and inject the same standards into both judge prompts.
- Run two blind judges in parallel, synthesize confirmed versus suspect issues, and ask before Round 1 fixes.
- Terminal states are only approved or escalated.

### skill-creator

- Trigger: new skills, agent instructions, documenting AI usage patterns.
- Path: `/home/luis/.config/opencode/skills/skill-creator/SKILL.md`
- Create skills only for reusable AI guidance, not one-off documentation.
- Use valid frontmatter and the standard sections: Activation Contract, Hard Rules, Decision Gates, Execution Steps, Output Contract, References.
- Keep skill bodies concise and put examples or schemas in local references/assets.

### work-unit-commits

- Trigger: implementation, commit splitting, chained PRs, or keeping tests and docs with code.
- Path: `/home/luis/.config/opencode/skills/work-unit-commits/SKILL.md`
- Commit by deliverable work unit, not by file type.
- Keep tests with the code they verify and docs with user-visible changes.
- Each commit should tell a clear review story and remain rollback-friendly.
- If an SDD task risks exceeding 400 changed lines, group into reviewable chained slices before implementation.

## Project Standards Extracted During Init

- Expo Router app with routes under `app/`, shared UI in `components/`, hooks in `hooks/`, service/domain logic in `lib/`, and static schedule data in `data/`.
- TypeScript strict mode is enabled through `tsconfig.json`; path alias `@/*` maps to project root.
- Package manager is pnpm.
- Run `pnpm lint` for lintable changes.
- Use `pnpm exec tsc --noEmit` for type-sensitive verification because there is no `typecheck` package script.
- OAuth/native redirect validation requires an Expo development build; Expo Go is insufficient for the real Google OAuth flow.
- Do not commit secrets or private credentials. Use `.env.example` variables for public Expo config only.
