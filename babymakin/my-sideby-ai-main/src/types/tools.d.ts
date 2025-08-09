
export interface CustomTool {
  id: string;
  user_id: string;
  name: string;
  url: string;
  type: 'predefined' | 'custom' | 'scheduler';
  description?: string;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at?: string;
}

// Enhanced tool types matching the new database structure
export interface Tool {
  id: string;
  name: string;
  type: string;
  description: string | null;
  url: string;
  price_per_month: number | null;
  status: string;
  category?: string | null;
  icon_url?: string | null;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface UserTool {
  id: string;
  user_id: string;
  tool_id: string;
  assigned_by?: string | null;
  assigned_at: string;
  expires_at?: string | null;
  status: string;
  access_metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  tools?: Tool;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  color: string | null;
  icon_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolFavorite {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}
