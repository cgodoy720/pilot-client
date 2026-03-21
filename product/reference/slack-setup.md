# Slack Integration Setup

The Accounts page now includes Slack activity integration to show all messages mentioning each account.

## Features

- **Account-Specific Activity**: View all Slack messages that mention an account name
- **Searchable History**: Automatically searches your entire Slack workspace
- **Rich Message Display**: Shows channel, user, timestamp, and message content
- **Direct Links**: Click "View in Slack" to jump to the original message

## Setup Instructions

### 1. Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Enter app name: `Financial Forecasting Bot`
5. Select your workspace

### 2. Add Required Permissions

1. In your app settings, go to **"OAuth & Permissions"**
2. Under **"Scopes"** → **"Bot Token Scopes"**, add:
   - `channels:history` - View messages in public channels
   - `channels:read` - View basic channel information
   - `search:read` - Search workspace messages
   - `users:read` - View people in the workspace
   - `groups:history` - View messages in private channels (optional)
   - `im:history` - View messages in direct messages (optional)

### 3. Install App to Workspace

1. Scroll to **"OAuth Tokens for Your Workspace"**
2. Click **"Install to Workspace"**
3. Review permissions and click **"Allow"**
4. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)

### 4. Configure the Backend

Add the Slack token to your environment:

**Option A: Environment Variable (Recommended)**
```bash
export SLACK_BOT_TOKEN="xoxb-your-token-here"
```

**Option B: Add to your shell profile**
```bash
# Add to ~/.zshrc or ~/.bashrc
echo 'export SLACK_BOT_TOKEN="xoxb-your-token-here"' >> ~/.zshrc
source ~/.zshrc
```

**Option C: Create a .env file**
```bash
# Create financial_forecasting/.env
echo 'SLACK_BOT_TOKEN=xoxb-your-token-here' > financial_forecasting/.env
```

### 5. Restart the Backend

```bash
cd financial_forecasting
python3 main.py
```

You should see confirmation that Slack is connected in the startup logs.

## Usage

1. Navigate to the **Accounts** page
2. Click on any account name to open the detail dialog
3. Click the **"Slack Activity"** tab
4. View all messages mentioning that account

## Features in the Slack Tab

- **Message Count**: Shows total messages found in the tab label
- **Chronological Display**: Messages sorted by most recent first
- **Channel Context**: See which channel each message was posted in
- **User Attribution**: Know who wrote each message
- **Timestamps**: Full date and time for each message
- **Direct Links**: Click to view the message in Slack

## Troubleshooting

### "Slack Not Configured" Message

**Problem**: The Slack tab shows "Slack Not Configured"

**Solution**: 
- Make sure `SLACK_BOT_TOKEN` environment variable is set
- Restart the backend server after setting the variable
- Verify the token starts with `xoxb-`

### No Messages Found

**Problem**: "No Slack messages found mentioning [Account Name]"

**Possible Causes**:
1. The account name hasn't been mentioned in Slack
2. Messages are in private channels the bot can't access
3. Messages are too old (Slack free tier has limited history)

**Solutions**:
- Invite the bot to private channels: `/invite @Financial Forecasting Bot`
- Check if the account name is spelled exactly as it appears in Salesforce
- Try searching for a shorter version of the name

### Rate Limit Errors

**Problem**: "Slack rate limit exceeded"

**Solution**:
- Wait a few minutes and try again
- Reduce the number of accounts you're checking
- Consider upgrading your Slack plan for higher rate limits

### Permission Errors

**Problem**: "missing_scope" or permission denied errors

**Solution**:
1. Go back to your Slack App settings
2. Add the required scopes (see step 2 above)
3. Reinstall the app to your workspace
4. Get the new Bot Token
5. Update your `SLACK_BOT_TOKEN` environment variable
6. Restart the backend

## API Endpoint

The integration adds a new API endpoint:

```
GET /api/slack/account-activity/{account_name}?limit=50
```

Response:
```json
{
  "account_name": "Example Foundation",
  "messages": [
    {
      "text": "Just had a great meeting with Example Foundation...",
      "user": "john.smith",
      "channel": "general",
      "timestamp": "1699564800.123456",
      "permalink": "https://workspace.slack.com/archives/C123/p1699564800123456",
      "date": "2024-11-09T12:00:00Z"
    }
  ],
  "total": 1
}
```

## Privacy & Security

- The bot can only see messages in channels it's been added to
- All API calls use your Bot Token (keep it secure!)
- The token is stored as an environment variable (never committed to git)
- Consider workspace policies about bot access to sensitive channels

## Future Enhancements

Potential improvements to consider:

- Filter by date range
- Filter by channel
- Show message threads/replies
- Export activity reports
- Real-time notifications for new mentions
- Integration with opportunity creation (auto-create opps from Slack)
- AI-powered sentiment analysis of account mentions

## Support

For issues with Slack integration:
- Check Slack API status: [https://status.slack.com](https://status.slack.com)
- Review Slack API docs: [https://api.slack.com/methods/search.messages](https://api.slack.com/methods/search.messages)
- Check backend logs for detailed error messages

