#!/bin/bash

# 🚀 MedGuide Development Tools Setup Script
# This script sets up the complete development environment with AI tools

echo "🚀 Setting up MedGuide Development Tools..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Installing dependencies..."
npm install

print_status "Setting up CLI tools..."
chmod +x tools/cli/dev-tool.js
chmod +x tools/cli/ai-generator.js

print_status "Creating necessary directories..."
mkdir -p frontend/src/components
mkdir -p frontend/src/pages
mkdir -p frontend/src/__tests__
mkdir -p backend/routes
mkdir -p backups

print_status "Setting up global CLI access..."
npm link

print_success "🎉 Setup complete! You can now use:"
echo ""
echo "  medguide-dev --help                    # Show all commands"
echo "  medguide-dev start                     # Start development"
echo "  medguide-dev ai:templates              # List AI templates"
echo "  medguide-dev ai:generate component Button  # Generate component"
echo "  medguide-dev ai:generate feature UserProfile  # Generate full feature"
echo ""
echo "  npm run dev-tool -- --help             # Alternative usage"
echo "  npm run dev:clean                      # Clean restart"
echo "  npm run dev:frontend-only              # Frontend only"
echo "  npm run dev:backend-only               # Backend only"
echo ""

print_status "Testing CLI tool..."
if npm run dev-tool -- --help > /dev/null 2>&1; then
    print_success "CLI tool is working correctly!"
else
    print_error "CLI tool test failed"
fi

print_status "Testing AI generation..."
if npm run dev-tool -- ai:templates > /dev/null 2>&1; then
    print_success "AI generation system is working!"
else
    print_error "AI generation test failed"
fi

echo ""
print_success "🚀 MedGuide Development Tools are ready to use!"
print_status "Visit http://localhost:4000 to see your application"
print_status "Use 'medguide-dev start' to begin development"
