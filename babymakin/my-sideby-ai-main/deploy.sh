
#!/bin/bash

# This script helps with deploying to Vercel

# Make sure we're up to date
git pull

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

echo "Current branch is: $CURRENT_BRANCH"
echo "Preparing to deploy to Vercel..."

# Get the last commit message to show what's being deployed
LAST_COMMIT=$(git log -1 --pretty=%B)
echo "Last commit message: $LAST_COMMIT"

# Run build locally to check for errors
npm run build --force --legacy-peer-deps

# If build succeeded, push to GitHub
if [ $? -eq 0 ]; then
  echo "Build successful! Pushing to GitHub..."
  
  # Force-with-lease push to ensure our changes take priority
  # This is safer than force-push but will ensure the remote is updated
  git push --force-with-lease origin $CURRENT_BRANCH
  
  echo "Push complete. Your changes should trigger a Vercel deployment."
  echo "Check your Vercel dashboard for deployment status."
  
  # If Vercel CLI is installed, force a deployment
  if command -v vercel &> /dev/null; then
    echo "Vercel CLI detected - forcing deployment to avoid cache issues..."
    vercel --prod --force --build-env LEGACY_PEER_DEPS=true
  else
    echo "Vercel CLI not installed. For more reliable deployments, consider installing it:"
    echo "npm i -g vercel"
    echo ""
    echo "Alternative: Go to Vercel dashboard and manually redeploy without cache:"
    echo "1. Visit your project settings"
    echo "2. Find the deployment and click 'Redeploy'"
    echo "3. Uncheck 'Use existing Build Cache'"
  fi
else
  echo "Build failed. Please fix the issues before deploying."
  exit 1
fi
