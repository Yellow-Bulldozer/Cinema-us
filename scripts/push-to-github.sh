#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/push-to-github.sh [remote-url]

REPO_URL="${1:-}"
if [ -z "$REPO_URL" ]; then
  read -p "Remote repository URL (HTTPS or SSH): " REPO_URL
fi

if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
fi

echo "Staging files..."
git add .

if git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "Repository already has commits. Creating a new commit with staged changes."
  git commit -m "Update project" || echo "No changes to commit"
else
  echo "Creating initial commit..."
  git commit -m "Initial commit" || true
fi

git branch -M main || true

if git remote get-url origin >/dev/null 2>&1; then
  echo "Updating remote 'origin' to $REPO_URL"
  git remote set-url origin "$REPO_URL"
else
  echo "Adding remote 'origin' -> $REPO_URL"
  git remote add origin "$REPO_URL"
fi

echo "Pushing to origin main (you may be prompted for credentials)..."
git push -u origin main

echo "Push complete."
