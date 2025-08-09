
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BetaUsersList } from './beta-users/BetaUsersList';
import { AddBetaUserForm } from './beta-users/AddBetaUserForm';
import { BetaUserJourney } from './beta-users/BetaUserJourney';
import { useBetaUsers } from './beta-users/useBetaUsers';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BetaUser } from './beta-users/types';

export const BetaUserManagement: React.FC = () => {
  const { user } = useAuth();
  const {
    betaUsers,
    loading,
    addingUser,
    addBetaUser,
    removeBetaUser,
    refreshLists
  } = useBetaUsers();
  const [selectedUser, setSelectedUser] = useState<BetaUser | null>(null);

  const handleSelectUser = (user: BetaUser) => {
    setSelectedUser(user);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Beta User Management</CardTitle>
        <CardDescription>Manage users with access to beta features</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Beta Users</TabsTrigger>
            <TabsTrigger value="journey">User Journey</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <AddBetaUserForm onAddUser={addBetaUser} addingUser={addingUser} />
            
            {loading ? (
              <div className="py-4 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <BetaUsersList 
                betaUsers={betaUsers}
                loading={loading}
                onRemoveUser={removeBetaUser}
                onSelectUser={handleSelectUser}
                selectedUserId={selectedUser?.id}
              />
            )}
          </TabsContent>

          <TabsContent value="journey">
            <BetaUserJourney selectedUser={selectedUser} />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={refreshLists}>
          Refresh Lists
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BetaUserManagement;
