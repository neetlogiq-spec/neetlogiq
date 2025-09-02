#!/bin/bash

echo "🔍 Verifying NeetLogIQ v2.1_final Backup Integrity..."
echo "=================================================="

# Check if all directories exist
echo "📁 Checking directory structure..."
if [ -d "frontend" ]; then
    echo "✅ Frontend directory exists"
else
    echo "❌ Frontend directory missing"
fi

if [ -d "backend" ]; then
    echo "✅ Backend directory exists"
else
    echo "❌ Backend directory missing"
fi

if [ -d "node_modules" ]; then
    echo "✅ Root node_modules exists"
else
    echo "❌ Root node_modules missing"
fi

if [ -d ".git" ]; then
    echo "✅ Git repository exists"
else
    echo "❌ Git repository missing"
fi

# Check if key files exist
echo ""
echo "📄 Checking key files..."
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json missing"
fi

if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json exists"
else
    echo "❌ package-lock.json missing"
fi

# Check frontend structure
echo ""
echo "🎨 Checking frontend structure..."
if [ -f "frontend/package.json" ]; then
    echo "✅ Frontend package.json exists"
else
    echo "❌ Frontend package.json missing"
fi

if [ -d "frontend/src" ]; then
    echo "✅ Frontend src directory exists"
else
    echo "❌ Frontend src directory missing"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend node_modules exists"
else
    echo "❌ Frontend node_modules missing"
fi

# Check backend structure
echo ""
echo "⚙️ Checking backend structure..."
if [ -f "backend/package.json" ]; then
    echo "✅ Backend package.json exists"
else
    echo "❌ Backend package.json missing"
fi

if [ -d "backend/src" ]; then
    echo "✅ Backend src directory exists"
else
    echo "❌ Backend src directory missing"
fi

if [ -d "backend/node_modules" ]; then
    echo "✅ Backend node_modules exists"
else
    echo "❌ Backend node_modules missing"
fi

# Check version history
echo ""
echo "📚 Checking version history..."
if [ -d "backups/colleges-versions" ]; then
    echo "✅ Version history exists"
    echo "   Available versions:"
    ls -la backups/colleges-versions/
else
    echo "❌ Version history missing"
fi

# Check file sizes
echo ""
echo "📊 Checking backup size..."
total_size=$(du -sh . | cut -f1)
echo "✅ Total backup size: $total_size"

echo ""
echo "🎯 Backup verification complete!"
echo "If all checks show ✅, your backup is ready for restoration."
echo ""
echo "📖 See README_RESTORATION.md for restoration instructions."
