#!/bin/bash

# Start the Financial Forecasting API server with Slack integration
# Set SLACK_BOT_TOKEN environment variable before running this script

if [ -z "$SLACK_BOT_TOKEN" ]; then
    echo "⚠️  Warning: SLACK_BOT_TOKEN not set"
    echo "   Slack integration will not work"
    echo "   Set it with: export SLACK_BOT_TOKEN='your-token-here'"
    echo ""
fi

echo "🚀 Starting Financial Forecasting API..."
echo "📊 Salesforce: Connected"

if [ -n "$SLACK_BOT_TOKEN" ]; then
    echo "💬 Slack: Configured (MCP Client Bot)"
else
    echo "💬 Slack: Not configured"
fi

echo ""
echo "🌐 API available at: http://localhost:8000"
echo "📖 API docs at: http://localhost:8000/docs"
echo ""

python3 main.py

