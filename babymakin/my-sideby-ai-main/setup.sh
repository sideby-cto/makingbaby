
#!/bin/bash

# sideby.ai Local Development Setup Script
# This script helps set up your local development environment for the sideby.ai project

echo "🚀 Setting up sideby.ai development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js v18+ and try again."
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed. Please install npm and try again."
  exit 1
fi

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
  echo "📄 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️ Please update the .env file with your actual API keys and secrets"
else
  echo "✓ .env file already exists"
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "📦 Installing Supabase CLI..."
  # Instructions vary by OS, so we'll just provide guidance
  echo "Please follow instructions at https://supabase.com/docs/guides/cli to install the Supabase CLI"
  echo "Then run this script again"
  exit 1
fi

echo "📦 Installing project dependencies..."
npm install

echo "✅ Setup complete! Next steps:"
echo "1. Update your .env file with your actual API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:8080 to see the application"
echo ""
echo "📚 See README.md for more detailed development instructions"

chmod +x dev.sh
echo "🔧 Created executable dev.sh script for running the app in development mode"
