---
name: github-course-delivery
description: Publish an approved MEGA course delivery through GitHub CLI: verify sign-in, create a public repository, file evidence-based issues, push source and rendered artifacts, and verify remote state.
---

# GitHub course delivery

Use the existing GitHub CLI. Check `Get-Command gh` on Windows and any known
portable installation before proposing another install. Read each command's
`--help` before using unfamiliar flags.

1. Run `gh auth status --hostname github.com`. If signed out, ask the human to
   complete `gh auth login --hostname github.com --git-protocol https --web`
   in their own terminal. Never request or print tokens.
2. Resolve the active account with `gh api user --jq .login`. Ask before creating
   a repository or changing GitHub. State that a public repo is readable by anyone.
3. Check whether the approved repo already exists. If it does not, use
   `gh repo create OWNER/REPO --public --description DESCRIPTION`.
4. Prepare one issue body per verified problem, with counts, reproduction,
   source evidence and explicit uncertainty. Use
   `gh issue create --repo OWNER/REPO --title TITLE --body-file FILE`.
   Before retrying a failed creation, check for an already-created issue.
5. Link the actual issue URLs in the signed page. Execute the real renderer and
   inspect computed content, styles and the signature-derived stamp. Preserve
   original evidence and immutable accepted decisions.
6. Commit only the approved deliverables in their own checkout. Exclude
   credentials and installed dependencies, remove local paths from generated
   source maps, use a GitHub noreply identity, and include the Copilot coauthor.
7. Push through the authenticated CLI credential helper without embedding
   credentials or changing global Git settings. Verify the public repo,
   remote file hashes, issue bodies and issue states with `gh`.
8. If an issue must close, confirm the instruction, read `gh issue close --help`,
   then use the appropriate `--reason` and verify with `gh issue view`.

Do not guess a course submission payload. Read its declared contract and submit
only after the public artifacts exist. A published repo is not an accepted
Challenge; follow the course response and save the debrief after acceptance.
