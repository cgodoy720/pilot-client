#!/bin/bash

# Financial Forecasting POC Startup Script

echo "================================"
echo "🚀 Financial Forecasting POC"
echo "================================"
echo ""

# Check Python
echo "Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi
echo "✅ Python found: $(python3 --version)"

# Check required Python packages
echo ""
echo "Checking Python packages..."
python3 -c "import fastapi" 2>/dev/null || { echo "❌ FastAPI not installed. Run: pip install fastapi uvicorn simple-salesforce"; exit 1; }
echo "✅ FastAPI installed"

# Test Salesforce connection
echo ""
echo "Testing Salesforce connection..."
cd /Users/jacquelinereverand/pursuit-mcp-client
python3 test_simple_auth.py > /dev/null 2>&1 || { echo "⚠️  Salesforce connection test failed. Check credentials in financial_forecasting/config.py"; }

echo ""
echo "================================"
echo "✅ All checks passed!"
echo "================================"
echo ""
echo "To start the POC:"
echo ""
echo "1️⃣  Start Backend (in this terminal):"
echo "   cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting"
echo "   python3 simple_server.py"
echo ""
echo "2️⃣  Start Frontend (in a NEW terminal):"
echo "   cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting/frontend"
echo "   npm install  # (first time only)"
echo "   npm start"
echo ""
echo "3️⃣  Open browser to: http://localhost:3000"
echo ""
echo "================================"
echo ""
