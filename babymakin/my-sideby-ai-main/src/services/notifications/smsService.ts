
import { supabase } from "@/integrations/supabase/client";

/**
 * Formats a phone number string into a standard format
 * @param phoneNumber The raw phone number input from the user
 * @returns A formatted phone number string
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid US phone number (10 digits)
  if (digitsOnly.length === 10) {
    // Format as +1XXXXXXXXXX
    return `+1${digitsOnly}`;
  } 
  // If it already has a country code (likely starts with a +)
  else if (phoneNumber.startsWith('+')) {
    return digitsOnly.length > 0 ? `+${digitsOnly}` : '';
  } 
  // Default case: just add +1 if it's not already formatted
  else {
    return digitsOnly.length > 0 ? `+1${digitsOnly}` : '';
  }
}

/**
 * Validates if a phone number string is in a valid format
 * @param phoneNumber The phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation - should have at least 10 digits
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  return digitsOnly.length >= 10;
}

/**
 * Sends an SMS notification via the Supabase Edge Function
 * @param phoneNumber The recipient's phone number
 * @param message The message content to send
 * @returns A promise with the result of the SMS sending operation
 */
export async function sendSMSNotification(
  phoneNumber: string, 
  message: string,
  userId?: string
): Promise<{ success: boolean; error?: any; sid?: string }> {
  try {
    // Validate phone number before sending
    if (!isValidPhoneNumber(phoneNumber)) {
      console.error("Invalid phone number format:", phoneNumber);
      return { 
        success: false, 
        error: "Invalid phone number. Please ensure it includes the country code (e.g., +1 for US)." 
      };
    }
    
    // Format the phone number to ensure it's in E.164 format (+1XXXXXXXXXX)
    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log("Sending SMS to formatted number:", formattedNumber);
    
    // Call the Supabase Edge Function to send the SMS
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        phoneNumber: formattedNumber,
        message,
        userId
      }
    });
    
    if (error) {
      console.error("Error sending SMS:", error);
      return { success: false, error };
    }
    
    return { success: true, sid: data?.sid };
  } catch (error) {
    console.error("Exception sending SMS:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
