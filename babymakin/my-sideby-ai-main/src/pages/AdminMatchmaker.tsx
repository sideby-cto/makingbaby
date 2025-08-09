
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { UsersGrid } from "@/components/admin/matchmaker/UsersGrid";
import { EnhancedUsersGrid } from "@/components/admin/matchmaker/components/EnhancedUsersGrid";
import { MatchesList } from "@/components/admin/matchmaker/components/MatchesList";
import { EnhancedCardDealingView } from "@/components/admin/matchmaker/card-dealing/EnhancedCardDealingView";
import { Profile } from "@/components/admin/matchmaker/types/matchmaking";

const AdminMatchmaker = () => {
  const [activeTab, setActiveTab] = useState("enhanced");

  const handleUserSelect = (user: Profile) => {
    // This is only used for the Users & Matching tab now
    console.log('User selected in Users & Matching tab:', user);
  };

  return (
    <AdminLayout>
      <div 
        className="container mx-auto p-6" 
        data-testid="admin-matchmaker-page"
      >
        <div className="mb-6" data-testid="matchmaker-header">
          <h1 
            className="text-3xl font-bold" 
            data-testid="matchmaker-title"
          >
            Matchmaker
          </h1>
          <p 
            className="text-gray-600" 
            data-testid="matchmaker-description"
          >
            Manage user matching, view existing matches, and deal cards
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full" 
          data-testid="matchmaker-tabs"
        >
          <TabsList 
            className="grid w-full grid-cols-3" 
            data-testid="matchmaker-tabs-list"
          >
            <TabsTrigger 
              value="enhanced" 
              data-testid="enhanced-matching-tab"
              className="text-sm"
            >
              Enhanced Matching
            </TabsTrigger>
            <TabsTrigger 
              value="matches" 
              data-testid="match-list-tab"
              className="text-sm"
            >
              Match List
            </TabsTrigger>
            <TabsTrigger 
              value="cards" 
              data-testid="deal-cards-tab"
              className="text-sm"
            >
              Deal Cards
            </TabsTrigger>
          </TabsList>
          
          <TabsContent 
            value="enhanced" 
            className="mt-6" 
            data-testid="enhanced-matching-content"
          >
            <EnhancedUsersGrid />
          </TabsContent>
          
          <TabsContent 
            value="matches" 
            className="mt-6" 
            data-testid="match-list-content"
          >
            <MatchesList />
          </TabsContent>

          <TabsContent 
            value="cards" 
            className="mt-6" 
            data-testid="deal-cards-content"
          >
            <EnhancedCardDealingView />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminMatchmaker;
