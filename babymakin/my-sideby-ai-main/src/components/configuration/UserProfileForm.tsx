
import { useState } from "react";
import { Profile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "./MultiSelect";
import { Loader2 } from "lucide-react";

interface UserProfileFormProps {
  profile: Profile;
}

export const UserProfileForm = ({ profile }: UserProfileFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    bio: profile.bio || "",
    teaching_experience: profile.teaching_experience || "",
    subjects: profile.subjects || [],
    location: profile.location || ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (name: string, values: string[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: values
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          teaching_experience: formData.teaching_experience,
          subjects: formData.subjects,
          location: formData.location
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="e.g., San Francisco, CA or just California"
        />
        <p className="text-sm text-gray-500">
          Share as much or as little as you're comfortable with (city, state, region, etc.)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio || ""}
          onChange={handleInputChange}
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="teaching_experience">Teaching Experience</Label>
        <Textarea
          id="teaching_experience"
          name="teaching_experience"
          value={formData.teaching_experience || ""}
          onChange={handleInputChange}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Subjects</Label>
        <MultiSelect
          values={formData.subjects || []}
          onChange={(values) => handleMultiSelectChange("subjects", values)}
          placeholder="Add subjects..."
        />
      </div>

      <Button 
        type="submit" 
        className="w-full md:w-auto"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
};
