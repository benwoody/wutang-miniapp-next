# Status Badges for README

Add these badges to your main README.md file to show the current status of your project:

## GitHub Actions Status Badge

```markdown
[![CI Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml)
```

## Test Coverage Badge

```markdown
![Coverage](https://img.shields.io/badge/coverage-89.02%25-brightgreen)
```

## Node.js Version Badge

```markdown
![Node.js](https://img.shields.io/badge/node.js-18.x%20%7C%2020.x-brightgreen)
```

## License Badge

```markdown
![License](https://img.shields.io/badge/license-MIT-blue)
```

## Example README Header

```markdown
# Wu-Tang Name Generator

[![CI Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml)
![Coverage](https://img.shields.io/badge/coverage-89.02%25-brightgreen)
![Node.js](https://img.shields.io/badge/node.js-18.x%20%7C%2020.x-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A Next.js application that generates Wu-Tang names based on your Farcaster username and creates NFTs with custom canvas images.

## Features

- 🎤 Generate unique Wu-Tang names
- 🖼️ Create custom canvas images with compression
- 🔗 Mint NFTs on Base network
- 🧪 Comprehensive test suite (96 tests, 89% coverage)
- 🚀 Automated CI/CD with GitHub Actions
```

## Dynamic Coverage Badge

For a dynamic coverage badge that updates automatically, you can use:

```markdown
![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/YOUR_USERNAME/YOUR_GIST_ID/raw/coverage-badge.json)
```

This requires setting up a GitHub Action to update a gist with coverage data.

## All Available Badges

```markdown
<!-- Build Status -->
[![CI Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml)

<!-- Test Coverage -->
![Coverage](https://img.shields.io/badge/coverage-89.02%25-brightgreen)

<!-- Node.js Version -->
![Node.js](https://img.shields.io/badge/node.js-18.x%20%7C%2020.x-brightgreen)

<!-- TypeScript -->
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)

<!-- Next.js -->
![Next.js](https://img.shields.io/badge/next.js-15.3.3-black)

<!-- React -->
![React](https://img.shields.io/badge/react-19.0.0-blue)

<!-- License -->
![License](https://img.shields.io/badge/license-MIT-blue)

<!-- Tests -->
![Tests](https://img.shields.io/badge/tests-96%20passing-brightgreen)

<!-- Blockchain -->
![Blockchain](https://img.shields.io/badge/blockchain-Base-blue)

<!-- Framework -->
![Framework](https://img.shields.io/badge/framework-Farcaster-purple)
```

Remember to replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.
