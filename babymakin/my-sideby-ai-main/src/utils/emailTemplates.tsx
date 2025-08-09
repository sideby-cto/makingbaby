
import type { NotificationsByType } from '@/types/notifications';
import { 
  formatNotificationType, 
  generateDigestEmailHTML 
} from '@/utils/emailFormatters';

interface EmailContentProps {
  type: 'single' | 'digest';
  notifications: Record<string, any[]>;
}

export const generateEmailContent = ({ type, notifications }: EmailContentProps): string => {
  const currentYear = new Date().getFullYear();
  
  // Mock profile for preview purposes
  const previewProfile = {
    first_name: 'Preview User',
    email: 'preview@example.com'
  };
  
  // For preview purposes, we use the shared formatter
  return generateDigestEmailHTML(previewProfile, notifications);
};

// Re-export formatters for convenience
export { formatNotificationType };
