# Instructions: Create Main Branch and Merge

Due to branch naming restrictions in the development environment, I cannot directly push a `main` branch. However, you can easily create it via the GitHub web interface.

## Step-by-Step Instructions

### Step 1: Navigate to Your Repository

Go to: `https://github.com/DavidROliverBA/bac4-standalone`

---

### Step 2: Create Main Branch from Current Branch

**Option A: Using Branch Dropdown (Easiest)**

1. Click the branch dropdown (currently shows `claude/c4-modelling-tool-011CUbkZoZSDqAgLByfVtaJR`)
2. Type `main` in the search box
3. Click "Create branch: main from 'claude/c4-modelling-tool-011CUbkZoZSDqAgLByfVtaJR'"

**Option B: Using GitHub Settings**

1. Go to **Settings** → **Branches**
2. Click "Add branch" or use the default branch section
3. Create a new branch called `main` from `claude/c4-modelling-tool-011CUbkZoZSDqAgLByfVtaJR`

---

### Step 3: Set Main as Default Branch

1. Go to **Settings** → **Branches**
2. Under "Default branch", click the switch icon ⇄
3. Select `main` from the dropdown
4. Click "Update"
5. Confirm the change

---

### Step 4: Verify Branch Creation

Run this command to verify the main branch exists remotely:

```bash
git fetch origin
git branch -r
```

You should see:
```
origin/claude/c4-modelling-tool-011CUbkZoZSDqAgLByfVtaJR
origin/main
```

---

### Step 5: Update Your Local Repository

```bash
# Fetch the new main branch
git fetch origin main

# Create local main branch tracking remote
git checkout -b main origin/main

# Verify you're on main
git branch
```

---

### Step 6: (Optional) Clean Up Claude Branch

Once main is established and set as default, you can optionally delete the claude development branch:

**On GitHub:**
1. Go to branches page: `https://github.com/DavidROliverBA/bac4-standalone/branches`
2. Find `claude/c4-modelling-tool-011CUbkZoZSDqAgLByfVtaJR`
3. Click the trash icon to delete

**Locally:**
```bash
# Make sure you're on main first
git checkout main

# Delete local claude branch
git branch -D claude/c4-modelling-tool-011CUbkZoZSDqAgLByfVtaJR
```

---

## Current Branch Status

**Branch:** `claude/c4-modelling-tool-011CUbkZoZSDqAgLByfVtaJR`
**Latest Commit:** `41d197a Add comprehensive HLD JSON automation guide`
**All Changes Pushed:** ✅ Yes

**What's Included:**
- ✅ Mermaid export functionality
- ✅ Templates feature removed
- ✅ Annotations feature removed
- ✅ README.md updated for v1.0.0
- ✅ BLOG_POST.md created (5,000+ words)
- ✅ HLD_JSON_GUIDE.md created (70+ pages)
- ✅ v1.0.0 tag created locally

---

## Alternative: Rename Current Branch to Main

If you prefer to simply rename the current branch to `main` (no merge needed):

**On GitHub:**
1. Go to the main repository page
2. Click on "Branches" (under the repository name)
3. Find `claude/c4-modelling-tool-011CUbkZoZSDqAgLByfVtaJR`
4. Click the pencil icon (rename)
5. Change name to `main`
6. Set as default branch in Settings

**Locally:**
```bash
# Rename local branch
git branch -m claude/c4-modelling-tool-011CUbkZoZSDqAgLByfVtaJR main

# Update remote tracking
git fetch origin
git branch -u origin/main main

# Push if needed
git push origin -u main
```

---

## Why This is Necessary

The development environment restricts branch pushes to branches matching the pattern `claude/*-{session-id}`. This is a security measure to prevent unauthorized branch creation. The GitHub web interface does not have this restriction, so you can create the `main` branch there directly.

---

## Verification Checklist

After completing the steps above, verify:

- [ ] `main` branch exists on GitHub
- [ ] `main` is set as the default branch
- [ ] Local repository is updated (`git fetch origin`)
- [ ] You can checkout main locally (`git checkout main`)
- [ ] All commits from claude branch are present in main
- [ ] v1.0.0 tag exists (push with `git push origin v1.0.0`)

---

## Next Steps

Once main is established:

1. **Push the v1.0.0 tag:**
   ```bash
   git checkout main
   git push origin v1.0.0
   ```

2. **Create GitHub Release:**
   - Go to Releases → "Draft a new release"
   - Choose tag: `v1.0.0`
   - Title: "v1.0.0 - Initial Production Release"
   - Use release notes from tag or create custom notes
   - Attach `bac4-standalone.html` as binary

3. **Update Documentation Links:**
   - Ensure README links work
   - Add release badge if desired

---

**Need Help?**

If you encounter any issues with these steps, you can:
1. Check GitHub documentation: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository
2. Contact GitHub support
3. Ask me to help troubleshoot specific errors

---

**Status:** Ready for main branch creation on GitHub ✅
