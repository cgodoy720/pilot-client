#!/bin/bash
# Installation script for pursuit-mcp-client

set -e

echo "🚀 Installing Pursuit MCP Client..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.8+ is required. Found: $python_version"
    exit 1
fi

echo "✅ Python version: $python_version"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Install in development mode
echo "🔗 Installing package in development mode..."
pip install -e .

echo "✅ Installation completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Copy .env.example to .env and fill in your credentials"
echo "2. Run 'source venv/bin/activate' to activate the environment"
echo "3. Run 'python examples/basic_usage.py' to test the client"
echo "4. Or run 'mcp-client --demo all' to test all services"
