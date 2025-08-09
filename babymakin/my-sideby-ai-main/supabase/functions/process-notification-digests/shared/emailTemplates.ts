export const TEMPLATE_VERSION = "2.1.0";
export function generateEmailHTML(profile, notifications) {
  const { first_name, email } = profile;
  const notificationCount = notifications.length;
  // Group notifications by type
  const groupedNotifications = {};
  notifications.forEach((notification)=>{
    const type = notification.notification_type || 'general';
    if (!groupedNotifications[type]) {
      groupedNotifications[type] = [];
    }
    groupedNotifications[type].push(notification);
  });
  const notificationSections = Object.entries(groupedNotifications).map(([type, typeNotifications])=>{
    const typeTitle = formatNotificationType(type);
    const notificationItems = typeNotifications.map((notification)=>`
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 8px 0;">
            <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">${notification.title}</h4>
            <p style="margin: 0; color: #475569; line-height: 1.5;">${notification.content}</p>
            ${notification.data?.cta_url && notification.data?.cta_text ? `
              <div style="margin-top: 12px;">
                <a href="${notification.data.cta_url}" style="background-color: #3b82f6; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">${notification.data.cta_text}</a>
              </div>
            ` : ''}
          </div>
        `).join('');
    return `
        <div style="margin: 24px 0;">
          <h3 style="color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">${typeTitle} (${typeNotifications.length})</h3>
          ${notificationItems}
        </div>
      `;
  }).join('');
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your sideby Updates</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #ffffff; color: #171717; padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0; }
        .content { padding: 32px 24px; }
        .footer { background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 14px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">sideby</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Your Learning Community Updates</p>
        </div>
        <div class="content">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Hi${first_name ? ` ${first_name}` : ''}!</h2>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 24px;">
            ${notificationCount === 1 ? "You have a new update from your sideby learning community." : `You have ${notificationCount} new updates from your sideby learning community.`}
          </p>
          ${notificationSections}
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
              Visit your <a href="https://my.sideby.ai/dashboard" style="color: #3b82f6; text-decoration: none;">sideby dashboard</a> to see all your updates and continue your learning journey.
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} sideby. All rights reserved.</p>
          <p style="margin: 0;">You're receiving this because you're part of the sideby community.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
function formatNotificationType(type) {
  switch(type){
    case 'match_message':
      return 'Messages';
    case 'match_created':
      return 'New Matches';
    case 'new_idea':
      return 'New Content';
    case 'journey_notification':
      return 'Journey Updates';
    default:
      return type.replace(/_/g, ' ').replace(/\b\w/g, (l)=>l.toUpperCase());
  }
}
