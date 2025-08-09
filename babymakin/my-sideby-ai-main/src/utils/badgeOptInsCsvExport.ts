import { exportToCSV } from './csvExport';
import { BadgeOptInWithDetails } from '@/hooks/useAdminBadgeOptIns';

interface BadgeOptInExportData {
  'User Email': string;
  'First Name': string;
  'Last Name': string;
  'Badge Name': string;
  'Badge Type': string;
  'Badge Description': string;
  'Notifications Enabled': string;
  'Opted In Date': string;
  'Last Updated': string;
}

export const exportBadgeOptInsToCSV = (optIns: BadgeOptInWithDetails[], filename?: string) => {
  const csvData: BadgeOptInExportData[] = optIns.map(optIn => ({
    'User Email': optIn.user_email,
    'First Name': optIn.user_first_name,
    'Last Name': optIn.user_last_name,
    'Badge Name': optIn.badge_name,
    'Badge Type': optIn.badge_type,
    'Badge Description': optIn.badge_description,
    'Notifications Enabled': optIn.notifications_enabled ? 'Yes' : 'No',
    'Opted In Date': new Date(optIn.opted_in_at).toLocaleDateString(),
    'Last Updated': new Date(optIn.updated_at).toLocaleDateString()
  }));

  const defaultFilename = `badge-opt-ins-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(csvData, filename || defaultFilename);
};