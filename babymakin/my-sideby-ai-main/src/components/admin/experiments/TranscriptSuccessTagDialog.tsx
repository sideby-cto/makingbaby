import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCreateStudentSuccessSign } from "@/hooks/useStudentSuccessSigns";
import { SIGN_TYPE_LABELS, SIGN_TYPE_DESCRIPTIONS, CONFIDENCE_LABELS } from "@/types/student-success";
import type { StudentSuccessSign, CreateStudentSuccessSign } from "@/types/student-success";
import { FileText } from "lucide-react";

interface TranscriptSuccessTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  studentId: string;
  studentName: string;
  transcriptId?: string;
}

export const TranscriptSuccessTagDialog = ({
  open,
  onOpenChange,
  selectedText,
  studentId,
  studentName,
  transcriptId
}: TranscriptSuccessTagDialogProps) => {
  const [formData, setFormData] = useState<Partial<CreateStudentSuccessSign>>({
    student_id: studentId,
    transcript_id: transcriptId,
    sign_type: 'engagement',
    confidence_level: 3,
    detection_method: 'manual',
    evidence_text: selectedText
  });

  const createMutation = useCreateStudentSuccessSign();

  // Auto-suggest sign type based on selected text
  const suggestSignType = (text: string): StudentSuccessSign['sign_type'] => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.match(/\b(understand|got it|makes sense|comprehend|grasp)\b/)) {
      return 'comprehension';
    }
    if (lowerText.match(/\b(keep going|don't give up|try again|persist|continue)\b/)) {
      return 'persistence';
    }
    if (lowerText.match(/\b(work together|collaborate|help|team|share)\b/)) {
      return 'collaboration';
    }
    if (lowerText.match(/\b(creative|innovative|unique|original|idea)\b/)) {
      return 'creativity';
    }
    if (lowerText.match(/\b(participate|contribute|discuss|speak|join)\b/)) {
      return 'participation';
    }
    
    return 'engagement'; // default
  };

  // Update suggested sign type when selectedText changes
  useEffect(() => {
    if (selectedText) {
      const suggested = suggestSignType(selectedText);
      setFormData(prev => ({
        ...prev,
        sign_type: suggested,
        evidence_text: selectedText,
        description: `Demonstrated ${SIGN_TYPE_LABELS[suggested].toLowerCase()} through conversation`
      }));
    }
  }, [selectedText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.sign_type) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        student_id: studentId,
        transcript_id: transcriptId,
        sign_type: formData.sign_type,
        description: formData.description,
        evidence_text: selectedText,
        confidence_level: formData.confidence_level || 3,
        detection_method: 'manual'
      });
      
      // Reset form and close dialog
      setFormData({
        student_id: studentId,
        transcript_id: transcriptId,
        sign_type: 'engagement',
        confidence_level: 3,
        detection_method: 'manual',
        evidence_text: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create success sign:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      student_id: studentId,
      transcript_id: transcriptId,
      sign_type: 'engagement',
      confidence_level: 3,
      detection_method: 'manual',
      evidence_text: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tag Success Sign for {studentName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected Text Display */}
          <div className="space-y-2">
            <Label>Selected Evidence</Label>
            <div className="p-3 bg-gray-50 rounded-md border">
              <p className="text-sm italic text-gray-700">"{selectedText}"</p>
            </div>
          </div>

          {/* Sign Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="sign_type">Success Sign Type</Label>
            <Select
              value={formData.sign_type}
              onValueChange={(value: StudentSuccessSign['sign_type']) => 
                setFormData(prev => ({ ...prev, sign_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sign type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SIGN_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="space-y-1">
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-gray-500">
                        {SIGN_TYPE_DESCRIPTIONS[key as StudentSuccessSign['sign_type']]}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the success behavior you observed..."
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
            />
          </div>

          {/* Confidence Level */}
          <div className="space-y-2">
            <Label htmlFor="confidence_level">Confidence Level</Label>
            <Select
              value={formData.confidence_level?.toString()}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, confidence_level: parseInt(value) as StudentSuccessSign['confidence_level'] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select confidence level" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONFIDENCE_LABELS).map(([level, label]) => (
                  <SelectItem key={level} value={level}>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={
                          parseInt(level) <= 2 ? 'border-red-200 text-red-700' :
                          parseInt(level) === 3 ? 'border-yellow-200 text-yellow-700' :
                          'border-green-200 text-green-700'
                        }
                      >
                        {label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !formData.description}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Success Sign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};