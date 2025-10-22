# Git Push Script
# This script will push your Gimie API v2.0 to GitHub

Write-Host "🚀 Pushing Gimie API v2.0 to GitHub..." -ForegroundColor Green

# Remove any existing git lock files
if (Test-Path ".git\index.lock") {
    Remove-Item ".git\index.lock" -Force
    Write-Host "Removed git lock file" -ForegroundColor Yellow
}

# Initialize git repository
Write-Host "Initializing git repository..." -ForegroundColor Blue
git init

# Add remote origin
Write-Host "Adding remote origin..." -ForegroundColor Blue
git remote add origin https://github.com/Giulia3112/Gimie-API-2.0.git

# Add important files only (excluding node_modules)
Write-Host "Adding project files..." -ForegroundColor Blue
git add package.json
git add package-lock.json
git add server.js
git add README.md
git add .gitignore
git add vercel.json
git add deploy-vercel.md
git add test-deployed-api.js
git add src/
git add tests/
git add scripts/
git add mobile-examples/
git add env.production.example

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Blue
git commit -m "🚀 Initial commit: Gimie API v2.0 with multi-currency support

✨ Features:
- Multi-currency price detection and conversion
- RESTful API with comprehensive endpoints
- SQLite database integration
- Security middleware (Helmet, CORS, Rate Limiting)
- Error handling and validation
- Health monitoring endpoints
- Mobile app integration examples
- Production deployment configuration

🌍 Supported Currencies: BRL, USD, EUR, GBP, JPY, CAD, AUD, MXN
📱 Mobile Ready: React Native, Flutter, Web examples included
🔒 Security: Input validation, rate limiting, security headers
📊 Database: SQLite with proper schema and migrations
🚀 Deployment: Vercel configuration included"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Blue
git branch -M main
git push -u origin main

Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "🔗 Repository: https://github.com/Giulia3112/Gimie-API-2.0" -ForegroundColor Cyan
Write-Host "📱 Ready for mobile app integration!" -ForegroundColor Magenta
