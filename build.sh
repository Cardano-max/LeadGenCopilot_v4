#!/bin/bash
set -e

echo "🚀 Starting LeadGen Copilot custom build process..."

# Navigate to backend directory
cd backend

echo "📦 Installing dependencies with npm install (no lock file)..."
npm install --no-package-lock --legacy-peer-deps --production

echo "🌐 Installing Chromium browser for Playwright..."
npx playwright install chromium

echo "✅ Build completed successfully!"