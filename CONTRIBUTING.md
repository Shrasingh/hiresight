# Contributing & release workflow

Hiresight uses three long-lived branches so that work is developed, verified,
and released in separate stages.

| Branch    | Purpose                                   | Deploys to                                   |
|-----------|-------------------------------------------|----------------------------------------------|
| `develop` | Integration branch for day-to-day work    | Vercel preview deployment (per push)         |
| `staging` | Release candidate / QA sign-off           | Vercel preview deployment (per push)         |
| `master`  | Production. Only receives merges from `staging` | Vercel **production** (https://hiresight-three.vercel.app) |

Vercel's Git integration builds a preview for every non-production branch and
deploys `master` to production. No separate staging infrastructure is used.

## Day-to-day flow

1. Branch from `develop`:
   ```bash
   git checkout develop && git pull
   git checkout -b feat/short-description   # or fix/, docs/, chore/
   ```
2. Commit with [Conventional Commits](https://www.conventionalcommits.org/)
   subjects (`feat:`, `fix:`, `docs:`, `ci:`, `chore:`).
3. Run the checks locally before pushing:
   ```bash
   npm run lint
   npm run build
   ```
4. Open a pull request into `develop`. GitHub Actions (`.github/workflows/ci.yml`)
   runs lint and a production build on every PR and on every push to the three
   branches.

## Promotion

```
feature/* ──PR──▶ develop ──PR──▶ staging ──PR──▶ master
                 (preview)       (QA sign-off)   (production)
```

- **develop → staging**: open a PR when a set of changes is ready for testing.
  Verify the staging preview URL that Vercel posts on the PR (sign in, complete
  onboarding, generate a quiz / cover letter, save and export a resume).
- **staging → master**: open a PR once QA passes. Merging triggers the
  production deployment. Tag the release if useful (`git tag v0.x.0`).
- Hotfixes branch from `master`, merge into `master`, and are then merged back
  into `staging` and `develop` so the branches do not diverge.

## Database migrations

Schema changes go through Prisma migrations and are committed with the code:

```bash
npx prisma migrate dev --name describe_change   # local, creates the SQL file
npx prisma migrate deploy                       # staging / production
```

## Recommended GitHub settings (repository owner)

These cannot be set from the code base and need to be configured once in
GitHub → Settings → Branches (rulesets):

- Protect `master` and `staging`: require a pull request, require the
  **CI / Lint & build** status check, and block force pushes.
- Optionally protect `develop` the same way without the review requirement.
