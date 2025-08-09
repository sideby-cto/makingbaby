
import { Button } from "@/components/ui/button";
import { Upload, FileDown } from "lucide-react";
import { useState } from "react";

interface TranscriptUploaderProps {
  profileId: string | null;
  isProcessing?: boolean;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TranscriptUploader = ({ 
  profileId, 
  isProcessing = false, 
  onFileChange 
}: TranscriptUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (onFileChange) {
        onFileChange(e);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border p-5 shadow-sm">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Upload Transcript</h3>
      
      {!profileId ? (
        <p className="text-sm text-muted-foreground mb-3 bg-slate-50 p-3 rounded-md">
          Please select a user first before uploading a transcript
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload an UpDuo .vtt transcript file to analyze
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant={selectedFile ? "outline" : "default"}
              className={`relative w-full justify-center py-6 ${selectedFile ? 'border-primary-300 bg-primary-50' : 'bg-primary-500 hover:bg-primary-600'}`}
              disabled={!profileId || isProcessing}
            >
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".vtt"
                disabled={!profileId || isProcessing}
              />
              {selectedFile ? (
                <div className="flex items-center gap-2">
                  <FileDown className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">
                    {selectedFile.name.length > 25 
                      ? `${selectedFile.name.substring(0, 22)}...` 
                      : selectedFile.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 mr-1" />
                  <span className="font-medium">Choose File</span>
                </div>
              )}
            </Button>
          </div>
          
          {selectedFile && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {Math.round(selectedFile.size / 1024)} KB · Click button again to change file
            </p>
          )}
          
          {isProcessing && (
            <div className="mt-3 text-sm font-medium text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200 flex items-center justify-center">
              <div className="animate-pulse mr-2 bg-amber-500 h-2 w-2 rounded-full" />
              Processing transcript... This may take a minute.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
