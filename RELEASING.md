# Releasing @vex-chat/crypto

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

## Dependency Chain

```
@vex-chat/types
  └─ @vex-chat/crypto    ← you are here
      └─ @vex-chat/libvex
          └─ vex-desktop
```

**Publish types first** if it has changes, then publish crypto.

## Day-to-Day Workflow

### 1. Work on a feature branch

```bash
git checkout -b my-feature
# ... make changes ...
```

### 2. Add a changeset before pushing

```bash
npx changeset
```

This prompts you to:
- Select the package (`@vex-chat/crypto`)
- Choose bump type (patch / minor / major)
- Write a short summary of the change

It creates a file in `.changeset/` — commit it with your code.

### 3. Push and open a PR

```bash
git add .
git commit -m "my feature"
git push -u origin my-feature
```

### 4. Merge to master

After merge, the **Release** GitHub Action will:
1. Detect pending changesets
2. Open a **"chore: version packages"** PR with bumped version + updated CHANGELOG.md
3. When you merge that PR, it publishes to npm automatically

```

## Release Candidates

```bash
npx changeset pre enter rc    # enter RC mode
npx changeset version          # produces e.g. 0.9.0-rc.0
npx changeset publish          # publishes with --tag rc

# ... more changes + changesets ...
npx changeset version          # produces 0.9.0-rc.1
npx changeset publish

# ready for stable:
npx changeset pre exit
npx changeset version          # produces 0.9.0
npx changeset publish          # publishes as @latest
```

## GitHub Secrets Required

- `NPM_TOKEN` — npm access token with publish permission for `@vex-chat` scope
- `GITHUB_TOKEN` — provided automatically by GitHub Actions

## Local Development

You can still use `yalc` for local cross-repo development:

```bash
yarn push   # builds and pushes to yalc for local consumers
```

When publishing for real, changesets handles versioning — yalc is just for local dev loops.
