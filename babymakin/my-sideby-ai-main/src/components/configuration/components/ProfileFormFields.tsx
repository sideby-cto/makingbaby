
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "../MultiSelect";

interface ProfileFormFieldsProps {
  formData: {
    first_name: string;
    last_name: string;
    location: string;
    bio: string;
    teaching_experience: string;
    hats: string[];
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onMultiSelectChange: (name: string, values: string[]) => void;
}

export const ProfileFormFields = ({
  formData,
  onInputChange,
  onMultiSelectChange,
}: ProfileFormFieldsProps) => {
  return (
    <>
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={onInputChange}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={onInputChange}
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={onInputChange}
          placeholder="e.g., San Francisco, CA or just California"
        />
        <p className="text-sm text-gray-500">
          Share as much or as little as you're comfortable with (city, state, region, etc.)
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio || ""}
          onChange={onInputChange}
          placeholder="Tell us about yourself..."
          className="min-h-[120px]"
        />
      </div>

      {/* Teaching Experience */}
      <div className="space-y-2">
        <Label htmlFor="teaching_experience">Teaching Experience</Label>
        <Textarea
          id="teaching_experience"
          name="teaching_experience"
          value={formData.teaching_experience || ""}
          onChange={onInputChange}
          placeholder="Describe your teaching experience, years in education, subject areas, etc."
          className="min-h-[100px]"
        />
      </div>

      {/* Hats */}
      <div className="space-y-2">
        <Label>Hats</Label>
        <MultiSelect
          values={formData.hats || []}
          onChange={(values) => onMultiSelectChange("hats", values)}
          placeholder="Add hats you wear..."
        />
      </div>
    </>
  );
};
