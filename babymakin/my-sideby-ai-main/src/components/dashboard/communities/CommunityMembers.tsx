
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PacingLevel, databaseToPacingLevel } from "./types";

interface CommunityMember {
  community_id: string;
  first_name: string;
  last_initial: string;
  pacing_level: PacingLevel;
  role: "community_manager" | "member";
  status: string;
}

interface CommunityMembersProps {
  communityId: string;
}

export const CommunityMembers = ({ communityId }: CommunityMembersProps) => {
  const { data: members, isLoading } = useQuery({
    queryKey: ["community-members", communityId],
    queryFn: async () => {
      // We now use the updated database function that returns status
      const { data, error } = await supabase.rpc('get_community_members', {
        community_id_param: communityId
      });
      
      if (error) throw error;
      
      // Convert the database format to our application format
      // Filter out any members with status 'deleted'
      const activeMembers = (data as any[])
        .filter(member => member.status !== 'deleted')
        .map(member => ({
          ...member,
          // Convert from DB format using helper function
          pacing_level: databaseToPacingLevel(member.pacing_level)
        })) as CommunityMember[];
        
      return activeMembers;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!members?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Members</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Pacing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, index) => (
              <TableRow key={index}>
                <TableCell>{member.first_name} {member.last_initial}.</TableCell>
                <TableCell className="capitalize">{member.role}</TableCell>
                <TableCell className="capitalize">
                  {member.pacing_level ? member.pacing_level.replace('_', ' ') : 'Not set'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
