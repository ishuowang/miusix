# Repository workflow

- After implementing a requested change, run the relevant type checks and builds.
- When validation passes, commit the scoped changes and push the current task branch without waiting for a separate push request.
- Open or update a pull request when the current branch is not the default branch.
- Prefix all new working branches with `feature/`.
- Delete working branches after their pull requests have been merged.
- After a successful Vercel preview deployment, point `pre-miusix.vercel.app` at that deployment.
- Never commit `.env` files, credentials, generated build output, dependencies, or local media.
- Use SSH for Git transport.
- Do not use GitHub APIs or `gh` to star or watch repositories, or to follow users.
