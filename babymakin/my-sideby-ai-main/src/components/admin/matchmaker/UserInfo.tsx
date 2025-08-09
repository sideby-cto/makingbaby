
import type { MatchUser } from "./types/matches";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AvailabilityDropdown } from "./AvailabilityDropdown";

interface UserInfoProps {
  user: MatchUser;
}

export const UserInfo = ({ user }: UserInfoProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewAs = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ impersonating_user_id: userId })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "View mode changed",
        description: "You are now viewing the app as the selected user",
      });

      // Redirect to dashboard to see the app as the impersonated user
      navigate('/dashboard');
    } catch (error) {
      console.error('Error setting impersonation:', error);
      toast({
        title: "Error",
        description: "Failed to change view mode",
        variant: "destructive",
      });
    }
  };

  const displayName = user.first_name || user.last_name ? 
    `${user.first_name || ''} ${user.last_name || ''}`.trim() :
    'Unnamed User';

  return (
    <>
      <h3 className="text-lg font-semibold">
        <button
          onClick={() => handleViewAs(user.id)}
          className="text-purple-600 hover:text-purple-800 hover:underline focus:outline-none"
        >
          {displayName}
        </button>
      </h3>
      
      {user.subjects && user.subjects.length > 0 && (
        <div className="mt-2">
          <p className="text-gray-600">Hats:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {user.subjects.map((hat) => (
              <span
                key={hat}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {hat}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2">
        <p className="text-gray-600">Teaching Experience:</p>
        <p className="text-gray-900">{user.teaching_experience || 'Not specified'}</p>
      </div>
      
      <AvailabilityDropdown userId={user.id} />
    </>
  );
};
