import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Crew } from "../types";

interface EditCrewDialogProps {
  crew: Crew | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (crew: Crew & { logo_file?: File }) => Promise<void>;
  onCrewChange: (crew: Crew) => void;
}

export const EditCrewDialog: React.FC<EditCrewDialogProps> = ({
  crew,
  isOpen,
  onOpenChange,
  onUpdate,
  onCrewChange
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, deleteFile } = useFileUpload({ bucket: 'crew-logos' });

  useEffect(() => {
    if (crew?.logo_url) {
      setLogoPreview(crew.logo_url);
    } else {
      setLogoPreview(null);
    }
    setLogoFile(null);
  }, [crew]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    if (crew?.logo_url) {
      await deleteFile(crew.logo_url);
      if (crew) {
        onCrewChange({ ...crew, logo_url: undefined });
      }
    }
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (crew) {
      const updatedCrew = { ...crew };
      if (logoFile) {
        (updatedCrew as any).logo_file = logoFile;
      }
      await onUpdate(updatedCrew);
    }
  };

  if (!crew) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Crew</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Crew Name</Label>
            <Input 
              id="edit-name" 
              value={crew.name} 
              onChange={(e) => onCrewChange({...crew, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-code">Crew Code</Label>
            <Input 
              id="edit-code" 
              value={crew.code} 
              onChange={(e) => onCrewChange({...crew, code: e.target.value.toLowerCase().replace(/\s+/g, '')})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input 
              id="edit-description"
              value={crew?.description || ""} 
              onChange={(e) => crew && onCrewChange({...crew, description: e.target.value})}
              placeholder="Enter crew description"
            />
          </div>

          <div className="space-y-2">
            <Label>Crew Logo</Label>
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
            onClick={handleSave}
            disabled={uploading}
          >
            {uploading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};