# Git Initialization Script
# Run this before first commit to GitHub

Write-Host "🚀 Preparing IoT-perusteet repository for GitHub..." -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win"
    exit 1
}

Write-Host "✅ Git is installed" -ForegroundColor Green

# Initialize git if not already
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Check .gitignore
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore exists" -ForegroundColor Green
} else {
    Write-Host "❌ .gitignore missing!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Checking for sensitive files..." -ForegroundColor Yellow
Write-Host ""

# List files that should NOT be committed
$sensitivePatterns = @(
    "*.db",
    "*.sqlite",
    "node_modules",
    ".env",
    "*secret*",
    "*.log"
)

$foundIssues = $false

foreach ($pattern in $sensitivePatterns) {
    $files = git ls-files | Select-String -Pattern $pattern
    if ($files) {
        Write-Host "⚠️  Found files matching '$pattern':" -ForegroundColor Red
        $files | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
        $foundIssues = $true
    }
}

if ($foundIssues) {
    Write-Host ""
    Write-Host "❌ Sensitive files found! Please remove them or update .gitignore" -ForegroundColor Red
    Write-Host ""
    Write-Host "To remove from git (but keep locally):"
    Write-Host "   git rm --cached <filename>" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ No sensitive files detected" -ForegroundColor Green
Write-Host ""

# Check for Discord webhook in config files
Write-Host "🔍 Checking for Discord webhooks in code..." -ForegroundColor Yellow
$webhookPattern = "https://discord.com/api/webhooks/\d+/"
$configFiles = Get-ChildItem -Recurse -Include "config.js","*.env" -Exclude "*.example.*",".env.example"

$foundWebhooks = $false
foreach ($file in $configFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match $webhookPattern) {
        Write-Host "⚠️  Webhook found in: $($file.FullName)" -ForegroundColor Red
        $foundWebhooks = $true
    }
}

if ($foundWebhooks) {
    Write-Host ""
    Write-Host "❌ Discord webhooks found in code!" -ForegroundColor Red
    Write-Host "   Replace with: process.env.DISCORD_WEBHOOK_URL" -ForegroundColor Cyan
    Write-Host "   Or use placeholder: YOUR_WEBHOOK_ID/YOUR_TOKEN" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ No webhooks in tracked files" -ForegroundColor Green
Write-Host ""

# Show what will be committed
Write-Host "📋 Files ready to commit:" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "✅ Repository is ready for GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review GITHUB_CHECKLIST.md"
Write-Host "2. Stage files:  git add ."
Write-Host "3. Commit:       git commit -m 'Initial commit: IoT-perusteet course projects'"
Write-Host "4. Add remote:   git remote add origin https://github.com/AnttiRu/Iot-perusteet.git"
Write-Host "5. Push:         git push -u origin main"
Write-Host ""
