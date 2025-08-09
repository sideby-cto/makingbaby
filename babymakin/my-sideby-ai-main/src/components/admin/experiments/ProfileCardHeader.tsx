
import { Button } from "@/components/ui/button";
import { UserX, UserCog, BrainCircuit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { HardDeleteDialog } from "./HardDeleteDialog";

interface ProfileCardHeaderProps {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  userId: string;
  onRemoveUser: () => void;
  isRemoving: boolean;
}

export const ProfileCardHeader = ({
  firstName,
  lastName,
  email,
  userId,
  onRemoveUser,
  isRemoving
}: ProfileCardHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHardDeleteOpen, setIsHardDeleteOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const handleViewAs = async () => {
    try {
      setIsImpersonating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to use this feature",
          variant: "destructive",
        });
        return;
      }

      console.log(`Setting impersonation: admin ${user.id} impersonating user ${userId}`);

      const { error } = await supabase
        .from('profiles')
        .update({ impersonating_user_id: userId })
        .eq('id', user.id);

      if (error) {
        console.error("Error setting impersonation:", error);
        throw error;
      }

      // Invalidate profile query to ensure we get fresh data
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });

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
    } finally {
      setIsImpersonating(false);
    }
  };

  const handleHardDeleteComplete = () => {
    // Invalidate all relevant queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ['experiments'] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['profile-experiments'] });
    
    // Also invalidate specific experiment types
    ['stance_from_welcome', 'guts_vs_fear', 'stance'].forEach(expType => {
      queryClient.invalidateQueries({ queryKey: ['profile-experiments', expType] });
    });
  };

  const userName = `${firstName} ${lastName}`;

  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-xl font-semibold text-primary-600 group flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleViewAs}
                  className="hover:text-primary-700 hover:underline focus:outline-none transition-colors"
                  disabled={isImpersonating}
                >
                  {firstName} {lastName}
                  {isImpersonating && (
                    <span className="ml-2">
                      <BrainCircuit className="h-4 w-4 inline animate-spin" />
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>View sideby as this user</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <UserCog className="h-4 w-4 ml-1.5 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
      </div>
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full p-1 h-auto w-auto transition-colors"
              disabled={isRemoving}
              aria-label="User actions"
            >
              {isRemoving ? (
                <BrainCircuit className="h-4 w-4 animate-spin" />
              ) : (
                <UserX className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => setIsDialogOpen(true)}
              className="text-orange-600 focus:text-orange-700"
            >
              <UserX className="h-4 w-4 mr-2" />
              Soft Delete (Reversible)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setIsHardDeleteOpen(true)}
              className="text-red-600 focus:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hard Delete (Permanent)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Soft Delete Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soft Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to soft delete <span className="font-medium">{firstName} {lastName}</span>? 
              <ul className="mt-2 space-y-1 text-sm">
                <li>• This will mark the user as deleted in sideby</li>
                <li>• Any active matches will be cancelled</li>
                <li>• They will be removed from all communities</li>
                <li>• This action can be reversed by an admin</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onRemoveUser();
                setIsDialogOpen(false);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Soft Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Dialog */}
      <HardDeleteDialog
        open={isHardDeleteOpen}
        onOpenChange={setIsHardDeleteOpen}
        userId={userId}
        userEmail={email || ''}
        userName={userName}
        onDeleteComplete={handleHardDeleteComplete}
      />
    </div>
  );
};
