# Git Pre-commit Checklist

Before committing to GitHub, verify:

## 🔒 Security
- [ ] No API keys or tokens in code
- [ ] No passwords or secrets
- [ ] Discord webhook URL removed from config.js
- [ ] .env file not included (use .env.example instead)
- [ ] secred.py / secret.py not included

## 🗄️ Database & Files
- [ ] No .db or .sqlite files
- [ ] No node_modules/ directories
- [ ] No __pycache__/ directories
- [ ] No log files

## 📝 Documentation
- [ ] README.md is up to date
- [ ] All links work
- [ ] Screenshots are appropriate
- [ ] No personal information in docs

## 🧹 Cleanup
- [ ] Remove temporary files
- [ ] Remove test outputs
- [ ] Check .gitignore is working

## ✅ Before Push
```bash
# Check what will be committed
git status

# Review changes
git diff

# Check ignored files are actually ignored
git status --ignored

# Verify no secrets in commit
git log -p -1
```

## 🚨 If Secrets Were Committed

If you accidentally committed secrets:
1. **DO NOT PUSH**
2. Regenerate all secrets/tokens immediately
3. Use git reset or git rebase to remove the commit
4. Update .gitignore
5. Generate new credentials

## 📧 Contact
If unsure about any file, ask before committing!
