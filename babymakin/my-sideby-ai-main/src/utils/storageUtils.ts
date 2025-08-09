import { supabase } from '@/integrations/supabase/client';

export const getAnimationUrl = (filename: string): string => {
  try {
    const { data } = supabase.storage
      .from('animations')
      .getPublicUrl(filename);
    
    if (!data.publicUrl) {
      console.warn('Failed to get animation URL from Supabase storage for:', filename);
      return '';
    }
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting animation URL:', error);
    return '';
  }
};

export const SIDEBY_ANIMATION_URL = getAnimationUrl('Sideby_Ani7.gif');