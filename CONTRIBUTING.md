# Contributing to REMIND

## Branching Strategy

We use a **main + dev + feature branch** workflow.

```
main          ← production-ready code (protected, no direct pushes)
  └── dev     ← integration branch (all feature branches merge here)
       ├── feature/frontend-login
       ├── feature/backend-auth
       ├── feature/ai-sentiment
       └── fix/entry-form-bug
```

### Branch Rules

- **`main`** — Protected. Only updated via PR from `dev` at major milestones (mid-semester demo, final submission). Requires at least 1 approval.
- **`dev`** — The working integration branch. All feature branches merge here via PR. Requires at least 1 approval.
- **Feature branches** — Where you do your daily work. Always branch off `dev`.

### Branch Naming Convention

Use this format: `type/short-description`

| Type | Use for | Example |
|------|---------|---------|
| `feature/` | New functionality | `feature/frontend-dashboard` |
| `fix/` | Bug fixes | `fix/login-redirect` |
| `refactor/` | Code cleanup (no new features) | `refactor/api-routes` |
| `docs/` | Documentation only | `docs/update-readme` |

---

## How to Work on a Feature

### 1. Create your branch from dev

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### 2. Do your work

Make commits with clear messages:

```bash
git add .
git commit -m "Add login form with email validation"
```

**Commit message tips:**
- Start with a verb: Add, Fix, Update, Remove, Refactor
- Keep it under 72 characters
- Be specific: "Fix login redirect bug" not "fix stuff"

### 3. Push your branch

```bash
git push origin feature/your-feature-name
```

### 4. Open a Pull Request (PR)

- Go to the repo on GitHub
- Click "Compare & pull request"
- Set **base branch** to `dev` (NOT main)
- Fill out the PR template
- Request a review from at least one teammate
- Tag Sonakshi for final review

### 5. After approval

- The reviewer or Sonakshi will merge the PR
- Delete your feature branch after merge

---

## Pull Request Rules

- Every PR needs at least **1 approval** before merging
- No one merges their own PR without a review
- Keep PRs focused — one feature or fix per PR
- If your PR is large, break it into smaller ones
- Always pull the latest `dev` before opening a PR:

```bash
git checkout dev
git pull origin dev
git checkout your-branch
git merge dev
# resolve any conflicts, then push
```

---

## Code Standards

### General
- Use meaningful variable and function names
- Add comments for complex logic
- Don't commit `.env` files or API keys (they're in .gitignore)

### Frontend (React)
- One component per file
- Use functional components with hooks
- Use Tailwind utility classes for styling

### Backend (Node.js)
- Use `async/await` for asynchronous code
- Validate all inputs in middleware
- Return consistent JSON response format:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### AI Engine (Python)
- Use type hints on all functions
- Write docstrings for public functions
- Include unit tests for new features

---

## Need Help?

- Post in the **#dev-help** Discord channel
- Tag the relevant person based on their role
- If you're stuck on Git, ask Sonakshi — she manages the repo
