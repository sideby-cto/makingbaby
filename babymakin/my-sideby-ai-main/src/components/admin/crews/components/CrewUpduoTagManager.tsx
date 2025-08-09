
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crew } from "../types";
import { X } from "lucide-react";

interface CrewUpduoTagManagerProps {
  crew: Crew;
  onUpdate: (crew: Crew) => Promise<void>;
}

export const CrewUpduoTagManager: React.FC<CrewUpduoTagManagerProps> = ({
  crew,
  onUpdate
}) => {
  const [newTag, setNewTag] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Parse existing tags from crew metadata or use crew code as default
  const existingTags = crew.metadata?.upduo_tags || [crew.code];

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    setIsUpdating(true);
    try {
      const updatedTags = [...existingTags, newTag.trim()];
      const updatedCrew = {
        ...crew,
        metadata: {
          ...crew.metadata,
          upduo_tags: updatedTags
        }
      };
      
      await onUpdate(updatedCrew);
      setNewTag("");
    } catch (error) {
      console.error("Error adding tag:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    setIsUpdating(true);
    try {
      const updatedTags = existingTags.filter((tag: string) => tag !== tagToRemove);
      const updatedCrew = {
        ...crew,
        metadata: {
          ...crew.metadata,
          upduo_tags: updatedTags
        }
      };
      
      await onUpdate(updatedCrew);
    } catch (error) {
      console.error("Error removing tag:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upduo Tags</CardTitle>
        <CardDescription>
          Manage Upduo tags that will be automatically assigned to crew members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {existingTags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoveTag(tag)}
                disabled={isUpdating}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-tag">Add New Tag</Label>
            <Input
              id="new-tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter Upduo tag"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAddTag}
              disabled={!newTag.trim() || isUpdating}
              className="bg-[#FF5733] hover:bg-[#FF5733]/90"
            >
              {isUpdating ? "Adding..." : "Add Tag"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
