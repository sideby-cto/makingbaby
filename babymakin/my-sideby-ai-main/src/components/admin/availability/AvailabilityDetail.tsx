import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface AvailabilityDetailProps {
  selectedUserId: string | null;
}

export const AvailabilityDetail = ({ selectedUserId }: AvailabilityDetailProps) => {
  const [userData, setUserData] = useState<{ fullName: string, email: string } | null>(null);
  
  // Keep the user data fetch functionality
  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error("Error fetching user data:", error);
          throw error;
        }
        
        if (data) {
          const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
          setUserData({ 
            fullName: fullName || 'Unknown User', 
            email: data.email || '' 
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    
    if (selectedUserId) {
      fetchUserData(selectedUserId);
    } else {
      setUserData(null);
    }
  }, [selectedUserId]);

  if (!selectedUserId) {
    return (
      <Card className="h-full flex items-center justify-center bg-gray-50">
        <CardContent className="text-center py-12 px-4">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-1">No Member Selected</p>
          <p className="text-gray-400">Select a member from the list to view their details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            {userData?.fullName || 'Loading...'}
          </h2>
          {userData?.email && (
            <p className="text-sm text-gray-500 mt-1">{userData.email}</p>
          )}
        </div>
        
        <div className="bg-gray-50 p-6 rounded-md text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-1">Availability Feature Disabled</p>
          <p className="text-gray-500">The availability scheduling feature is currently under maintenance.</p>
        </div>
      </CardContent>
    </Card>
  );
};
