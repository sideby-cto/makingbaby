
import { supabase } from "@/integrations/supabase/client";

export interface UpduoUserData {
  firstName: string;
  lastName: string;
  email: string;
  crewCode?: string;
}

export const addUserToUpduo = async (userData: UpduoUserData) => {
  try {
    const { firstName, lastName, email, crewCode } = userData;
    
    // Determine which function to call based on crew code
    let functionName: string;
    let requestBody: any;
    
    if (crewCode && crewCode.trim() !== '') {
      // User has a crew code - use crew-specific function
      functionName = 'upduo-crew-tag';
      requestBody = { firstName, lastName, email, crewCode };
      console.log("Calling upduo-crew-tag function for user with crew code:", crewCode);
    } else {
      // No crew code - use default integration function
      functionName = 'upduo-integration';
      requestBody = { firstName, lastName, email };
      console.log("Calling upduo-integration function for user without crew code");
    }
    
    // Call the appropriate Supabase Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || "https://upffcxqiozqhdgfesmji.supabase.co"}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZmZjeHFpb3pxaGRnZmVzbWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxODU4NTcsImV4cCI6MjA1Mzc2MTg1N30.RNkakuJDMiO4bvN7Y1p-NlZYHr5obgOnDcwLQMdElLg"}`
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to add user to Upduo via ${functionName}:`, response.status, errorText);
      throw new Error(`Failed to add user to Upduo: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Response from ${functionName} function:`, result);
    return result;
  } catch (error) {
    console.error("Error adding user to Upduo:", error);
    throw error;
  }
};

export async function tagUserInUpduo(userData: {
  firstName: string;
  lastName: string;
  email: string;
  crewCode: string;
}) {
  try {
    console.log('Calling Upduo crew tag function with data:', userData);
    const { data, error } = await supabase.functions.invoke('upduo-crew-tag', {
      body: userData,
    });

    if (error) {
      console.error('Error from Upduo crew tag function:', error);
      throw error;
    }

    console.log('Successfully tagged user in Upduo:', data);
    return data;
  } catch (error) {
    console.error('Error tagging user in Upduo:', error);
    throw error;
  }
}

export async function removeUserFromUpduo(userId: string) {
  try {
    console.log('Removing user from Upduo:', userId);
    const { data, error } = await supabase.functions.invoke('remove-from-upduo', {
      body: { userId }
    });

    if (error) {
      console.error('Error removing user from Upduo:', error);
      throw error;
    }

    console.log('Successfully removed user from Upduo:', data);
    return data;
  } catch (error) {
    console.error('Error removing user from Upduo:', error);
    throw error;
  }
}
