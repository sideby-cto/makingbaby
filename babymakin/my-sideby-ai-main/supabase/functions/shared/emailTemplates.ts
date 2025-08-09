
// Shared email template system for consistent email formatting across all functions

/**
 * Email styles used across all email templates
 */
export const emailStyles = {
  container: "font-family: Arial, sans-serif;",
  header: "background-color: #FFFFFF; padding: 24px 0; text-align: center; border-bottom: 1px solid #eee;",
  logo: "display: inline-block;",
  content: "max-width: 600px; margin: 0 auto; padding: 40px 20px;",
  section: "margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;",
  title: "font-weight: bold; color: #171717;",
  message: "margin-top: 5px;",
  button: "background-color: #F87201; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block;",
  buttonContainer: "text-align: center; margin: 30px 0;",
  footer: "margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;",
  link: "color: #F87201; text-decoration: none;"
};

/**
 * Common function to generate an email template wrapper with consistent styling
 */
export function generateEmailTemplate(content: string, currentYear: number): string {
  return `
  <div style="${emailStyles.container}">
    <div style="${emailStyles.header}">
      <img src="https://my.sideby.ai/lovable-uploads/4fa666a9-c191-4ff7-9213-c43d4c9fc9aa.png" alt="sideby" width="150" style="${emailStyles.logo}">
    </div>
    
    <div style="${emailStyles.content}">
      ${content}

      <p style="${emailStyles.buttonContainer}">
        <a href="https://my.sideby.ai" style="${emailStyles.button}">
          Go to Dashboard
        </a>
      </p>

      <div style="${emailStyles.footer}">
        <p>You received this email because you're a member of the sideby learning community.</p>
        <p><a href="https://my.sideby.ai/settings" style="${emailStyles.link}">Manage notifications</a></p>
        <p style="color: #999;">&copy; ${currentYear} sideby</p>
      </div>
    </div>
  </div>
`;
}

/**
 * Format notification type for display
 */
export function formatNotificationType(type: string): string {
  switch (type) {
    case 'match_message':
      return 'Messages';
    case 'match_created':
      return 'New Matches';
    case 'new_idea':
      return 'New Content';
    default:
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

/**
 * Generate HTML for notification digest email with improved styling
 */
export function generateDigestEmailHTML(profile: any, notificationsByType: Record<string, any[]>): string {
  const currentYear = new Date().getFullYear();
  
  const contentSections = Object.keys(notificationsByType).map(type => `
    <div class="notification-section">
      <h3 style="color: #171717; margin: 20px 0 10px;">${formatNotificationType(type)}</h3>
      <ul style="list-style-type: none; padding: 0;">
        ${notificationsByType[type].map(notification => `
          <li class="notification-item" style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <div class="notification-title" style="font-weight: bold; color: #171717;">${notification.title}</div>
            <div class="notification-content" style="margin-top: 5px;">${notification.content}</div>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');
  
  const emailContent = `
    <h2 style="color: #171717; margin: 0 0 20px;">Your Recent Notifications</h2>
    <p style="margin: 0 0 20px;">Hello ${profile.first_name || 'there'},</p>
    <p style="margin: 0 0 20px;">Here's a summary of your recent notifications:</p>
    
    ${contentSections}
  `;
  
  return generateEmailTemplate(emailContent, currentYear);
}

// Version tracking for templates
export const TEMPLATE_VERSION = "1.0.0";
