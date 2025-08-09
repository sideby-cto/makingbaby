
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Zap, Settings } from "lucide-react";
import { MatchSuggestions } from "./matches/MatchSuggestions";
import { ProfileList } from "./profiles/ProfileList";
import { MatchCreationPanel } from "./matches/MatchCreationPanel";
import { useMatchHandler } from "@/hooks/useMatchHandler";

export const MatchmakerPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("suggestions");
  const { 
    showMatchDialog, 
    setShowMatchDialog, 
    selectedUsers, 
    setSelectedUsers,
    clearSelectedUsers,
    handleMatch,
    isCreating 
  } = useMatchHandler();

  return (
    <div className="space-y-6" data-testid="matchmaker-page">
      {/* Header */}
      <div className="flex items-center justify-between" data-testid="matchmaker-header">
        <div>
          <h1 className="text-2xl font-bold" data-testid="matchmaker-title">Matchmaker</h1>
          <p className="text-muted-foreground">Connect educators with similar goals and interests</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" data-testid="auto-matching-badge">
            <Zap className="h-3 w-3 mr-1" />
            Auto-matching: Active
          </Badge>
          <Button variant="outline" size="sm" data-testid="settings-button">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative" data-testid="search-section">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search educators, skills, or interests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="search-input"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="matchmaker-tabs">
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-list">
          <TabsTrigger value="suggestions" data-testid="suggestions-tab">
            <Users className="h-4 w-4 mr-2" />
            Match Suggestions
          </TabsTrigger>
          <TabsTrigger value="profiles" data-testid="profiles-tab">
            All Profiles
          </TabsTrigger>
          <TabsTrigger value="create" data-testid="create-tab">
            Create Match
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" data-testid="suggestions-content">
          <MatchSuggestions searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="profiles" data-testid="profiles-content">
          <Card>
            <CardHeader>
              <CardTitle data-testid="profiles-title">All Educator Profiles</CardTitle>
            </CardHeader>
            <CardContent data-testid="profiles-card-content">
              <ProfileList 
                searchTerm={searchTerm}
                onSelectUser={(user) => {
                  if (!selectedUsers) {
                    setSelectedUsers([user, null]);
                  } else if (!selectedUsers[1]) {
                    setSelectedUsers([selectedUsers[0], user]);
                    setShowMatchDialog(true);
                  } else {
                    setSelectedUsers([user, null]);
                  }
                }}
                selectedUsers={selectedUsers}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" data-testid="create-content">
          <MatchCreationPanel 
            selectedUsers={selectedUsers}
            onClearUsers={clearSelectedUsers}
            onMatch={handleMatch}
            isCreating={isCreating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
