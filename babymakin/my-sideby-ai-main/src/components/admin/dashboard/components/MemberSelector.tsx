
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/utils/admin/profileOperations";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

interface Member {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface MemberSelectorProps {
  selectedMemberId: string;
  onMemberSelect: (memberId: string) => void;
}

export const MemberSelector = ({ selectedMemberId, onMemberSelect }: MemberSelectorProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchMembers(debouncedSearchTerm);
    } else {
      fetchMembers();
    }
  }, [debouncedSearchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      console.log("Fetching members for admin user:", user?.email);
      
      // First check if current user is admin by email
      const isAdminUser = user?.email?.endsWith('@sideby.ai');
      console.log("User is admin (by email):", isAdminUser);
      
      if (!isAdminUser) {
        toast({
          title: "Access Denied",
          description: "Only admin users can select members",
          variant: "destructive"
        });
        return;
      }

      // Try multiple approaches to get all profiles
      let data = null;
      let error = null;

      // First try: Direct query (should work if RLS is properly configured)
      console.log("Attempting direct query...");
      const directResult = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('status', 'active')
        .order('first_name', { ascending: true });

      if (directResult.error) {
        console.error('Direct query failed:', directResult.error);
        
        // Second try: Use RPC function to check admin status and get profiles
        console.log("Attempting RPC function call...");
        const rpcResult = await supabase.rpc('debug_admin_check');
        console.log("Admin debug result:", rpcResult);
        
        if ((rpcResult.data as any)?.is_admin) {
          // If we're admin, try again with a different approach
          const retryResult = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .order('first_name', { ascending: true });
          
          data = retryResult.data;
          error = retryResult.error;
        } else {
          throw new Error("Admin verification failed");
        }
      } else {
        data = directResult.data;
        error = directResult.error;
      }

      if (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "Error",
          description: "Failed to load members. You may not have admin permissions.",
          variant: "destructive"
        });
        
        // Fallback: At least show the current user
        const fallbackData = [{
          id: user?.id || '',
          first_name: null,
          last_name: null,
          email: user?.email || null
        }];
        setMembers(fallbackData);
        return;
      }

      console.log("Successfully fetched members:", data?.length || 0);
      setMembers(data || []);

    } catch (error) {
      console.error('Error in fetchMembers:', error);
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive"
      });
      
      // Fallback to current user only
      if (user) {
        setMembers([{
          id: user.id,
          first_name: null,
          last_name: null,
          email: user.email || null
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const searchMembers = async (search: string) => {
    try {
      setLoading(true);
      
      const isAdminUser = user?.email?.endsWith('@sideby.ai');
      if (!isAdminUser) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
        .eq('status', 'active')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error searching members:', error);
        return;
      }

      setMembers(data || []);
    } catch (error) {
      console.error('Error in searchMembers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (member: Member) => {
    if (member.first_name || member.last_name) {
      return `${member.first_name || ''} ${member.last_name || ''}`.trim();
    }
    return member.email || 'Unknown User';
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            {selectedMember ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {getInitials(selectedMember.first_name || undefined, selectedMember.last_name || undefined)}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{getDisplayName(selectedMember)}</span>
                  {selectedMember.email && (
                    <span className="text-gray-500 text-sm">{selectedMember.email}</span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Select a member...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search members by name or email..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Searching..." : "No members found."}
              </CommandEmpty>
              <CommandGroup>
                {members.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={`${getDisplayName(member)} ${member.email}`}
                    onSelect={() => {
                      onMemberSelect(member.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedMemberId === member.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {getInitials(member.first_name || undefined, member.last_name || undefined)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{getDisplayName(member)}</span>
                        {member.email && (
                          <span className="text-gray-500 text-sm">{member.email}</span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {members.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          Found {members.length} member{members.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
