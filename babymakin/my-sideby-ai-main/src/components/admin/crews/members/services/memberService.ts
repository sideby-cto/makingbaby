
import { supabase } from "@/integrations/supabase/client";
import { CrewMember } from "../types";
import { toast } from "@/hooks/use-toast";
import { addUserToUpduo, removeUserFromUpduo } from "@/lib/upduo";

// Define crew code to Upduo tag mapping
const CREW_UPDUO_TAG_MAPPING: Record<string, string> = {
  'gatesonpostsecondary': 'gatesonpostsecondary',
  'demo': 'demo',
  'test': 'test',
  // Add more mappings as needed
};

/**
 * Loads crew members from the database
 */
export const fetchCrewMembers = async (crewId: string): Promise<CrewMember[]> => {
  try {
    const { data, error } = await supabase
      .from("crew_members")
      .select(`
        *,
        profiles!inner(
          first_name,
          last_name,
          email
        )
      `)
      .eq("crew_id", crewId)
      .order("joined_at", { ascending: false });

    if (error) throw error;

    // Transform the data to match our CrewMember interface
    const formattedMembers: CrewMember[] = (data || []).map((member: any) => ({
      id: member.id,
      user_id: member.user_id,
      crew_id: member.crew_id,
      joined_at: member.joined_at,
      status: member.status,
      is_lead: member.is_lead || false,
      profile: member.profiles
    }));

    console.log("Fetched crew members:", formattedMembers);
    return formattedMembers;
  } catch (error) {
    console.error("Error fetching crew members:", error);
    toast({
      title: "Error",
      description: "Failed to load crew members",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Gets crew information by ID including metadata
 */
const getCrewInfo = async (crewId: string) => {
  try {
    const { data, error } = await supabase
      .from('crews')
      .select('code, metadata')
      .eq('id', crewId)
      .single();
    
    if (error) throw error;
    
    // Parse metadata if it's a string, otherwise use as-is
    const metadata = data.metadata ? 
      (typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata) : 
      {};
    
    return {
      code: data.code,
      metadata
    };
  } catch (error) {
    console.error("Error fetching crew info:", error);
    // Return fallback data with empty metadata if crew lookup fails
    return { code: 'unknown', metadata: {} };
  }
};

/**
 * Adds a new member to the crew with Upduo integration
 */
export const addCrewMember = async (
  crewId: string, 
  email: string
): Promise<CrewMember | null> => {
  try {
    // First find the user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('email', email)
      .single();
    
    if (userError) {
      toast({
        title: "User Not Found",
        description: "No user found with that email address",
        variant: "destructive",
      });
      return null;
    }
    
    // Check if the user is already a crew member
    const { data: existingMember, error: checkError } = await supabase
      .from('crew_members')
      .select('id')
      .eq('crew_id', crewId)
      .eq('user_id', userData.id)
      .single();
    
    if (existingMember) {
      toast({
        title: "Already a Member",
        description: "This user is already a member of this crew",
        variant: "destructive",
      });
      return null;
    }
    
    // Get crew information
    const crewInfo = await getCrewInfo(crewId);
    
    // Add the user to the crew
    const { data: newMember, error: insertError } = await supabase
      .from('crew_members')
      .insert({
        crew_id: crewId,
        user_id: userData.id,
        is_lead: false
      })
      .select();
    
    if (insertError) throw insertError;
    
    // Tag user in Upduo using crew metadata tags or fallback to mapping
    const upduoTags = (crewInfo.metadata as any)?.upduo_tags || [CREW_UPDUO_TAG_MAPPING[crewInfo.code] || crewInfo.code];
    
    if (upduoTags.length > 0 && userData.first_name && userData.last_name) {
      try {
        // Use the first tag for now - could be enhanced to handle multiple tags
        await addUserToUpduo({
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: userData.email,
          crewCode: upduoTags[0]
        });
        
        toast({
          title: "Member Added Successfully",
          description: `${userData.first_name} has been added to the crew and tagged in Upduo`,
        });
      } catch (upduoError) {
        console.error("Failed to tag user in Upduo:", upduoError);
        toast({
          title: "Member Added",
          description: `${userData.first_name} has been added to the crew, but Upduo tagging failed`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Member Added",
        description: `${userData.first_name} has been added to the crew`,
      });
    }
    
    // Return the new member with profile
    if (newMember && newMember.length > 0) {
      return {
        id: newMember[0].id,
        user_id: newMember[0].user_id,
        crew_id: newMember[0].crew_id,
        joined_at: newMember[0].joined_at,
        status: newMember[0].status,
        is_lead: newMember[0].is_lead || false,
        profile: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email
        }
      };
    }
    
    return null;
  } catch (error: any) {
    console.error("Error adding crew member:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to add crew member",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Removes a member from the crew with Upduo integration
 */
export const removeCrewMember = async (memberId: string): Promise<boolean> => {
  try {
    // Get member info before deletion for Upduo removal
    const { data: memberData, error: memberError } = await supabase
      .from('crew_members')
      .select(`
        user_id,
        crews(code),
        profiles(first_name, last_name, email)
      `)
      .eq('id', memberId)
      .single();
    
    if (memberError) throw memberError;
    
    // Delete from crew_members table
    const { error } = await supabase
      .from('crew_members')
      .delete()
      .eq('id', memberId);
    
    if (error) throw error;
    
    // Remove from Upduo if crew has a mapping and user has profile
    const crewCode = (memberData.crews as any)?.code;
    const profile = Array.isArray(memberData.profiles) ? memberData.profiles[0] : memberData.profiles;
    
    if (crewCode && CREW_UPDUO_TAG_MAPPING[crewCode] && profile) {
      try {
        await removeUserFromUpduo(memberData.user_id);
        
        toast({
          title: "Member Removed Successfully",
          description: "The member has been removed from the crew and untagged from Upduo",
        });
      } catch (upduoError) {
        console.error("Failed to remove user from Upduo:", upduoError);
        toast({
          title: "Member Removed",
          description: "The member has been removed from the crew, but Upduo removal failed",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Member Removed",
        description: "The member has been removed from the crew",
      });
    }
    
    return true;
  } catch (error: any) {
    console.error("Error removing crew member:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to remove crew member",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Updates the crew lead status
 */
export const toggleCrewLeadStatus = async (
  crewId: string,
  memberId: string, 
  isCurrentlyLead: boolean
): Promise<boolean> => {
  try {
    if (!isCurrentlyLead) {
      // Remove current lead first (if any)
      await supabase
        .from('crew_members')
        .update({ is_lead: false })
        .eq('crew_id', crewId)
        .eq('is_lead', true);
    }

    // Update the selected member
    const { error } = await supabase
      .from('crew_members')
      .update({ is_lead: !isCurrentlyLead })
      .eq('id', memberId);

    if (error) throw error;
    
    toast({
      title: isCurrentlyLead ? "Crew Lead Removed" : "Crew Lead Assigned",
      description: isCurrentlyLead 
        ? "The member is no longer the crew lead" 
        : "The member has been assigned as the crew lead",
      variant: "default",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error updating crew lead:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to update crew lead",
      variant: "destructive",
    });
    return false;
  }
};
