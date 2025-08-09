
export function formatMessage(payload) {
  const { type, user } = payload;
  console.log('🔄 Formatting message for type:', type);
  
  // Special handling for session_completed notifications
  if (type === 'session_completed') {
    console.log('🎓 Processing session completed notification');
    // Skip user validation for session notifications
  } else {
    // Safety check for missing user data for other notification types
    if (!user || !user.email) {
      console.warn('⚠️ Incomplete user data in payload');
      return {
        text: `⚠️ Notification with incomplete user data`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Warning: Received incomplete notification*\n*Type:* ${type || 'unknown'}\n*Timestamp:* ${new Date().toISOString()}`
            }
          }
        ]
      };
    }
    console.log('✅ User data validated, formatting for type:', type);
  }
  
  switch(type){
    case 'new_signup':
      console.log('🎉 Formatting new signup message');
      return {
        text: `🎉 New sideby Member: ${user.first_name || user.email}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*New sideby Member! 🎉*\n*Name:* ${user.first_name || 'New'} ${user.last_name || 'User'}\n*Email:* ${user.email}\n*Joined:* ${new Date().toLocaleDateString()}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Welcome to the sideby community! 🚀`
            }
          }
        ]
      };
    
    case 'feature_request':
      console.log('📝 Formatting feature request message');
      return {
        text: `🚀 New Feature Request from ${user.first_name || user.email}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*New Feature Request* 🚀\n*From:* ${user.first_name || 'User'} (${user.email})\n*Priority:* ${payload.priority || 'Not specified'}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Description:*\n${payload.feature_description || payload.details || 'No description provided'}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Use Case:*\n${payload.use_case || 'No use case provided'}`
            }
          }
        ]
      };
    
    case 'support_request':
      console.log('🆘 Formatting support request message');
      return {
        text: `🆘 Support Request from ${user.first_name || user.email}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Support Request* 🆘\n*From:* ${user.first_name || 'User'} (${user.email})\n*Type:* ${payload.help_type || 'General'}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Details:*\n${payload.details || 'No details provided'}`
            }
          }
        ]
      };
    
    case 'sponsorship_request':
      console.log('💎 Formatting sponsorship request message');
      return {
        text: `💎 Tool Sponsorship Request from ${user.first_name || user.email}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Tool Sponsorship Request* 💎\n*From:* ${user.first_name || 'User'} (${user.email})`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Tool:* ${payload.tool_name || 'Not specified'}\n*District:* ${payload.district || 'Not specified'}\n*Region:* ${payload.region || 'Not specified'}`
            }
          }
        ]
      };
    
    case 'session_completed':
      console.log('🎓 Formatting session completed message');
      const session = payload.session || {};
      const participants = session.users || [];
      const participantNames = participants.map(user => `${user.firstName} ${user.lastName}`).join(', ');
      const sessionTitle = session.session_title || session.knowledgeNodes?.[0]?.name || 'Untitled Session';
      const duration = session.duration ? `${Math.round(session.duration / 60)} minutes` : 'Unknown duration';
      const sessionType = session.type || 'Unknown';
      
      return {
        text: `🎓 Upduo Session Completed: ${sessionTitle}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Upduo Session Completed* 🎓\n*Session:* ${sessionTitle}\n*Type:* ${sessionType}\n*Duration:* ${duration}\n*Participants:* ${participantNames}\n*Session ID:* ${session.id || 'Unknown'}`
            }
          }
        ]
      };
    
    default:
      console.log('📧 Formatting generic notification message');
      return {
        text: `📧 New notification from ${user.first_name || user.email}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*New Notification*\n*From:* ${user.first_name || 'User'} (${user.email})\n*Type:* ${type || 'Unknown'}\n*Content:* ${payload.details || 'No content provided'}`
            }
          }
        ]
      };
  }
}
