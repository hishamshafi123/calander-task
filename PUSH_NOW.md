# 🚀 Push to YOUR GitHub Repository

Your repository: **https://github.com/hishamshafi123/calander-task.git**

---

## Step 1: Configure Git (REQUIRED!)

Run these commands with YOUR information:

```bash
git config --global user.name "Hisham Shafi"
git config --global user.email "your.email@example.com"
```

**⚠️ Replace "your.email@example.com" with your actual email!**

Example:
```bash
git config --global user.name "Hisham Shafi"
git config --global user.email "hisham@example.com"
```

---

## Step 2: Add All Files

```bash
cd "/Users/macbookpro/google sheet len/life-org-2026"
git add .
```

---

## Step 3: Create First Commit

```bash
git commit -m "Initial commit: Life Organization 2026 - Task Management App

Features:
- Interactive calendar with clickable day view
- Categories board with inline editing
- Status board for workflow management
- Full CRUD for tasks and categories
- Dark mode support
- Notes and priority levels
- Beautiful UI with Tailwind CSS"
```

---

## Step 4: Connect to GitHub

```bash
git remote add origin https://github.com/hishamshafi123/calander-task.git
```

---

## Step 5: Set Branch Name

```bash
git branch -M main
```

---

## Step 6: Push to GitHub!

```bash
git push -u origin main
```

---

## 🎯 All Commands in Order

Copy and paste these one by one:

```bash
# 1. Configure git (replace email!)
git config --global user.name "Hisham Shafi"
git config --global user.email "your.email@example.com"

# 2. Go to directory
cd "/Users/macbookpro/google sheet len/life-org-2026"

# 3. Add files
git add .

# 4. Commit
git commit -m "Initial commit: Life Organization 2026 app"

# 5. Connect to GitHub
git remote add origin https://github.com/hishamshafi123/calander-task.git

# 6. Set branch
git branch -M main

# 7. Push!
git push -u origin main
```

---

## 🔐 Authentication

If it asks for password, you need a **Personal Access Token**:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Calendar Task App"
4. Check the **`repo`** checkbox
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

---

## ✅ After Pushing

Your code will be at: **https://github.com/hishamshafi123/calander-task**

---

## 🆘 Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/hishamshafi123/calander-task.git
```

### If you get "failed to push":
```bash
git pull origin main --rebase --allow-unrelated-histories
git push -u origin main
```

### If you get "Author identity unknown":
Make sure you ran step 1 with your actual email!

---

**Ready? Start with Step 1!** 🚀
