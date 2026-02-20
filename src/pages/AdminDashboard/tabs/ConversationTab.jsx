import React from 'react';
import ConversationAnalytics from '../../../components/ConversationAnalytics/ConversationAnalytics';

// Thin wrapper — ConversationAnalytics.jsx already has full UI
// Swap mock data for real API data in ConversationAnalytics.jsx
// when the /api/conversation-efficacy/* routes are ready in the server.
const ConversationTab = () => <ConversationAnalytics />;

export default ConversationTab;
