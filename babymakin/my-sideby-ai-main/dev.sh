
#!/bin/bash

# sideby.ai Development Script
# Runs the application in development mode

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ Missing required environment variables. Check your .env file."
  exit 1
fi

echo "🚀 Starting sideby.ai in development mode..."
npm run dev
