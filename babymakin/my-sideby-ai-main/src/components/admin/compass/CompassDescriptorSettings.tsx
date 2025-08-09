import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompassDescriptors, CompassDescriptor } from "@/hooks/useCompassDescriptors";
import { useSubmitHandler } from "@/hooks/useSubmitHandler";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, MessageCircle, TrendingUp, Users, Save } from "lucide-react";

const iconOptions = [
  { value: "BookOpen", label: "Book Open", icon: BookOpen },
  { value: "MessageCircle", label: "Message Circle", icon: MessageCircle },
  { value: "TrendingUp", label: "Trending Up", icon: TrendingUp },
  { value: "Users", label: "Users", icon: Users }
];

const colorOptions = [
  { value: "blue", label: "Blue", preview: "bg-blue-100 text-blue-800" },
  { value: "green", label: "Green", preview: "bg-green-100 text-green-800" },
  { value: "purple", label: "Purple", preview: "bg-purple-100 text-purple-800" },
  { value: "orange", label: "Orange", preview: "bg-orange-100 text-orange-800" }
];

export const CompassDescriptorSettings: React.FC = () => {
  const { descriptors, isLoading, refetch } = useCompassDescriptors();
  const [editingDescriptor, setEditingDescriptor] = useState<CompassDescriptor | null>(null);
  const { isSubmitting, submitWithHandler, retry } = useSubmitHandler();

  const handleEdit = (descriptor: CompassDescriptor) => {
    setEditingDescriptor({ ...descriptor });
  };

  const updateDescriptor = async () => {
    if (!editingDescriptor) {
      throw new Error('No descriptor selected for editing');
    }
    
    console.log('🔄 Updating compass descriptor:', editingDescriptor.stage);

    // Simple field validation
    const trimmedDisplayName = editingDescriptor.display_name?.trim();
    const trimmedDescription = editingDescriptor.description?.trim();
    
    if (!trimmedDisplayName) {
      throw new Error('Display name is required');
    }
    
    if (!trimmedDescription) {
      throw new Error('Description is required');
    }
    
    if (!editingDescriptor.icon_name) {
      throw new Error('Icon selection is required');
    }
    
    if (!editingDescriptor.color_scheme) {
      throw new Error('Color scheme selection is required');
    }

    const updateData = {
      display_name: trimmedDisplayName,
      description: trimmedDescription,
      icon_name: editingDescriptor.icon_name,
      color_scheme: editingDescriptor.color_scheme
    };

    // Single optimized database update
    const { error } = await supabase
      .from('journey_stage_config')
      .update(updateData)
      .eq('stage', editingDescriptor.stage);

    if (error) {
      console.error('❌ Database update error:', error);
      throw error; // Let the error handler classify the error type
    }

    console.log('✅ Compass descriptor updated successfully');
    return true;
  };

  const handleSave = async () => {
    await submitWithHandler(updateDescriptor, {
      onSuccess: () => {
        setEditingDescriptor(null);
        refetch();
      },
      successMessage: "Compass descriptor updated successfully",
      errorMessage: "Failed to update compass descriptor. Please try again.",
      timeout: 15000 // Increased timeout for better reliability
    });
  };

  const handleCancel = () => {
    setEditingDescriptor(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-semantic-text-primary">
          Compass Settings
        </h2>
        <div className="animate-pulse">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-8 bg-semantic-surface-secondary rounded mb-4" />
              <div className="h-4 bg-semantic-surface-secondary rounded mb-2" />
              <div className="h-4 bg-semantic-surface-secondary rounded w-2/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-semantic-text-primary">
          Compass Settings
        </h2>
        <p className="text-sm text-semantic-text-secondary">
          Manage the compass area descriptors that appear in the learning journey
        </p>
      </div>

      <div className="grid gap-4">
        {descriptors?.map((descriptor) => {
          const isEditing = editingDescriptor?.stage === descriptor.stage;
          const IconComponent = iconOptions.find(opt => opt.value === descriptor.icon_name)?.icon || BookOpen;
          const colorPreview = colorOptions.find(opt => opt.value === descriptor.color_scheme)?.preview || "bg-semantic-surface-secondary";

          return (
            <Card key={descriptor.stage} className="p-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium capitalize">
                      Editing {descriptor.stage} Area
                    </h3>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={isSubmitting} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Saving..." : "Save"}
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={editingDescriptor.display_name}
                        onChange={(e) => setEditingDescriptor({
                          ...editingDescriptor,
                          display_name: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="icon">Icon</Label>
                      <Select
                        value={editingDescriptor.icon_name}
                        onValueChange={(value) => setEditingDescriptor({
                          ...editingDescriptor,
                          icon_name: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <OptionIcon className="h-4 w-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="color">Color Scheme</Label>
                      <Select
                        value={editingDescriptor.color_scheme}
                        onValueChange={(value) => setEditingDescriptor({
                          ...editingDescriptor,
                          color_scheme: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${option.preview}`} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingDescriptor.description}
                      onChange={(e) => setEditingDescriptor({
                        ...editingDescriptor,
                        description: e.target.value
                      })}
                      placeholder="Enter a description for this compass area"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        <span className={`px-2 py-1 rounded text-sm font-medium ${colorPreview}`}>
                          {descriptor.display_name}
                        </span>
                      </div>
                      <span className="text-sm text-semantic-text-secondary capitalize">
                        ({descriptor.stage})
                      </span>
                    </div>
                    <p className="text-semantic-text-secondary">
                      {descriptor.description}
                    </p>
                  </div>
                  <Button onClick={() => handleEdit(descriptor)} variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};