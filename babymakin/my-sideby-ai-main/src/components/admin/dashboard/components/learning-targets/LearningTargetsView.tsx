
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface LearningTarget {
  id: string;
  target: string;
  created_at: string;
  user_id: string;
  session_id: string;
  proficiency: string;
  user: {
    first_name: string;
    last_name: string;
  };
  session: {
    created_at: string;
  };
}

export const LearningTargetsView = () => {
  const [learningTargets, setLearningTargets] = useState<LearningTarget[]>([]);
  const [filteredTargets, setFilteredTargets] = useState<LearningTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch learning targets from the posts table instead of saved_items
  useEffect(() => {
    const fetchLearningTargets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Query posts that might contain learning targets
        const { data, error } = await supabase
          .from("posts")
          .select(`
            id, 
            content, 
            created_at, 
            user_id, 
            type,
            profiles(first_name, last_name)
          `)
          .eq('type', 'idea')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Check if data is valid and has entries
        if (!data || !Array.isArray(data)) {
          setLearningTargets([]);
          setFilteredTargets([]);
          return;
        }
        
        // Transform data to match LearningTarget interface
        // Since we don't have actual learning targets anymore, we'll use posts as a proxy
        const formattedTargets = data.map((item) => ({
          id: item.id || "unknown-id",
          target: item.content || "No content",
          created_at: item.created_at || new Date().toISOString(),
          user_id: item.user_id || "unknown-user",
          session_id: "unknown", // No session data available
          proficiency: "unknown", // No proficiency data available
          user: {
            first_name: item.profiles?.first_name || "Unknown",
            last_name: item.profiles?.last_name || "User"
          },
          session: {
            created_at: item.created_at || new Date().toISOString()
          }
        }));
        
        setLearningTargets(formattedTargets);
        setFilteredTargets(formattedTargets);
      } catch (err) {
        console.error("Error fetching learning targets:", err);
        setError(`Failed to load learning targets: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLearningTargets();
  }, []);
  
  // Filter targets when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTargets(learningTargets);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = learningTargets.filter(target => 
      target.target.toLowerCase().includes(lowerSearchTerm) ||
      `${target.user.first_name} ${target.user.last_name}`.toLowerCase().includes(lowerSearchTerm) ||
      target.proficiency.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredTargets(filtered);
  }, [searchTerm, learningTargets]);

  // Get proficiency badge color
  const getProficiencyBadgeClass = (proficiency: string) => {
    const lowerProf = proficiency.toLowerCase();
    if (lowerProf.includes("beginner") || lowerProf.includes("low")) {
      return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    } else if (lowerProf.includes("intermediate") || lowerProf.includes("medium")) {
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    } else if (lowerProf.includes("advanced") || lowerProf.includes("high")) {
      return "bg-green-100 text-green-800 hover:bg-green-200";
    } else if (lowerProf.includes("expert") || lowerProf.includes("mastery")) {
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    }
    return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-full min-h-[400px]">
        <CardHeader>
          <CardTitle>Learning Targets</CardTitle>
          <CardDescription>Loading learning insights from posts...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-full min-h-[400px]">
        <CardHeader>
          <CardTitle>Learning Targets</CardTitle>
          <CardDescription>Error loading learning targets</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <X className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Learning Ideas</CardTitle>
        <CardDescription>Ideas and insights from community posts (Note: Learning targets feature has been simplified)</CardDescription>
        
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ideas, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <button 
                className="absolute right-3 top-3"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTargets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Filter className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium">No Learning Ideas Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? "Try adjusting your search criteria" : "No learning ideas have been posted yet"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-300px)] min-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Learning Idea</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTargets.map((target) => (
                  <TableRow key={target.id}>
                    <TableCell className="font-medium">
                      {target.target.length > 100 
                        ? target.target.substring(0, 100) + '...' 
                        : target.target}
                    </TableCell>
                    <TableCell>{`${target.user.first_name} ${target.user.last_name}`}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Posted Idea
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(target.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
