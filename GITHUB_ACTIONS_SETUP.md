# GitHub Actions CI/CD Setup

This project includes a comprehensive GitHub Actions workflow that automatically runs tests, linting, type checking, and builds on every push and pull request.

## 🚀 What the CI Pipeline Does

### Automated Testing
- **Multi-Node Testing**: Tests run on both Node.js 18.x and 20.x
- **Comprehensive Test Suite**: All 96 tests including Wu-Tang name generation, canvas image compression, and NFT minting
- **Code Coverage**: Generates and uploads coverage reports
- **Linting**: ESLint checks for code quality
- **Type Checking**: TypeScript compilation verification

### Build Verification
- **Next.js Build**: Ensures the application builds successfully
- **Artifact Storage**: Saves build files for 7 days

### Security
- **Dependency Audit**: Checks for known vulnerabilities
- **Moderate Level**: Flags moderate and high severity issues

## 📋 Setup Instructions

### 1. Enable GitHub Actions
The workflow is automatically enabled when you push the `.github/workflows/ci.yml` file to your repository.

### 2. Branch Protection (Recommended)
Set up branch protection rules in your GitHub repository:

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Select status checks: `Run Tests (18.x)`, `Run Tests (20.x)`, `Build Application`

### 3. Workflow Triggers
The CI pipeline runs on:
- **Push** to `main` or `develop` branches
- **Pull Requests** targeting `main` or `develop` branches

## 🔧 Available npm Scripts

```bash
# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Build application
npm run build

# Development server
npm run dev
```

## 📊 Workflow Status

You can monitor the workflow status in several ways:

### 1. GitHub Repository
- Go to the **Actions** tab in your repository
- View real-time progress and logs
- Download coverage reports and build artifacts

### 2. Pull Request Checks
- Status checks appear automatically on PRs
- Green ✅ = All tests passed
- Red ❌ = Tests failed (click for details)

### 3. Commit Status
- Commit history shows status badges
- Hover over badges for quick status info

## 🛠️ Troubleshooting

### Common Issues

#### Tests Failing in CI but Passing Locally
```bash
# Run tests exactly like CI does
npm ci  # Clean install
npm run lint
npm run type-check
npm run test:coverage
```

#### Node Version Differences
The CI tests on both Node 18.x and 20.x. If you see failures on one version:
```bash
# Test with specific Node version locally
nvm use 18  # or nvm use 20
npm ci
npm test
```

#### Build Failures
```bash
# Test build locally
npm run build
```

### Viewing Detailed Logs
1. Go to **Actions** tab in GitHub
2. Click on the failed workflow run
3. Click on the failed job (e.g., "Run Tests")
4. Expand the failed step to see detailed logs

## 📈 Coverage Reports

Coverage reports are generated and stored as artifacts:
- **Location**: Actions → Workflow Run → Artifacts
- **Retention**: 7 days
- **Format**: HTML reports you can download and view

## 🔒 Security Features

### Dependency Auditing
- Runs `npm audit` on every push
- Checks for moderate and high severity vulnerabilities
- Set to `continue-on-error: true` to not block builds for low-risk issues

### Best Practices
- Uses `npm ci` for reproducible builds
- Caches dependencies for faster runs
- Matrix testing across Node versions
- Artifact retention limits for storage efficiency

## 🚀 Future Enhancements

You can extend this workflow by adding:

### Deployment
```yaml
deploy:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: [test, build]
  if: github.ref == 'refs/heads/main'
  steps:
    # Add your deployment steps here
```

### Code Quality Tools
```yaml
- name: Run Prettier
  run: npm run format:check

- name: Run SonarQube
  uses: sonarqube-quality-gate-action@master
```

### Notifications
```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 📝 Workflow File Location

The workflow configuration is located at:
```
.github/workflows/ci.yml
```

This file defines all the automation rules and can be customized for your specific needs.
