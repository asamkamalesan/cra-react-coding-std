const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const setupGitHooks = () => {
  const hooksDir = path.join(__dirname, '.git', 'hooks')
  if (!fs.existsSync(hooksDir)) {
    console.log('Git hooks directory not found. Make sure Git is initialized.')
    return
  }

  const preCommitHook =
    process.platform === 'win32'
      ? `@echo off
    npx eslint src --fix
    npx prettier --write .
    exit /b %errorlevel%`
      : `#!/bin/sh
    npx eslint src --fix
    npx prettier --write .
    exit 0`

  const hookPath = path.join(hooksDir, 'pre-commit')
  fs.writeFileSync(hookPath, preCommitHook, { mode: 0o755 })
  console.log('✅ Git pre-commit hook installed successfully!')
}

const setupProject = () => {
  console.log(
    '📦 Setting up React project with ESLint, Prettier, Jest, and SCSS...'
  )

  // Install dependencies
  execSync(
    'npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier lint-staged jest @testing-library/react @testing-library/jest-dom sass',
    { stdio: 'inherit' }
  )

  // Create ESLint config
  const eslintConfig = {
    env: {
      browser: true,
      es6: true,
      jest: true,
    },
    extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['react', 'prettier'],
    rules: {
      'prettier/prettier': 'error',
      'react/prop-types': 'off',
    },
  }
  fs.writeFileSync('.eslintrc.json', JSON.stringify(eslintConfig, null, 2))

  // Create Prettier config
  const prettierConfig = {
    singleQuote: true,
    semi: false,
    trailingComma: 'es5',
  }
  fs.writeFileSync('.prettierrc', JSON.stringify(prettierConfig, null, 2))

  // Create Jest config
  const jestConfig = {
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  }
  fs.writeFileSync('jest.config.json', JSON.stringify(jestConfig, null, 2))

  // Add lint scripts to package.json
  const packageJsonPath = 'package.json'
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath))
  packageJson.scripts = {
    ...packageJson.scripts,
    lint: 'eslint src --fix',
    format: 'prettier --write .',
    test: 'jest',
  }
  packageJson['lint-staged'] = {
    '*.js': 'eslint --fix',
  }
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  // Setup Git hooks
  setupGitHooks()

  console.log(
    '🚀 React project template with coding standards, Jest, and SCSS is ready!'
  )
}

setupProject()
