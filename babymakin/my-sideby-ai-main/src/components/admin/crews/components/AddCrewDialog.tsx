
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { NewCrew } from "../types";


interface AddCrewDialogProps {
  onCreateCrew: (crew: NewCrew) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddCrewDialog: React.FC<AddCrewDialogProps> = ({ 
  onCreateCrew, 
  isOpen, 
  onOpenChange 
}) => {
  const [newCrew, setNewCrew] = useState<NewCrew>({
    name: "",
    code: "",
    description: ""
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading } = useFileUpload({ bucket: 'crew-logos' });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCrew({ ...newCrew, logo: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setNewCrew({ ...newCrew, logo: undefined });
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateCrew = async () => {
    await onCreateCrew(newCrew);
    setNewCrew({ name: "", code: "", description: "" });
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#FF5733] hover:bg-[#FF5733]/90">Add New Crew</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Crew</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Crew Name</Label>
            <Input 
              id="name" 
              value={newCrew.name} 
              onChange={(e) => setNewCrew({...newCrew, name: e.target.value})}
              placeholder="Enter crew name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Crew Code</Label>
            <Input 
              id="code" 
              value={newCrew.code} 
              onChange={(e) => setNewCrew({...newCrew, code: e.target.value.toLowerCase().replace(/\s+/g, '')})}
              placeholder="Enter crew code (no spaces)"
            />
            <p className="text-xs text-muted-foreground">
              This code will be used for enrolling users
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input 
              id="description" 
              value={newCrew.description} 
              onChange={(e) => setNewCrew({...newCrew, description: e.target.value})}
              placeholder="Enter crew description"
            />
          </div>

          <div className="space-y-2">
            <Label>Crew Logo (Optional)</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0"
                    onClick={handleRemoveLogo}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            className="bg-[#FF5733] hover:bg-[#FF5733]/90"
            onClick={handleCreateCrew}
            disabled={!newCrew.name || !newCrew.code || uploading}
          >
            {uploading ? "Creating..." : "Create Crew"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
