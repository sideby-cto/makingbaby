import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateStudentSuccessSign } from "@/hooks/useStudentSuccessSigns";
import { SIGN_TYPE_LABELS, SIGN_TYPE_DESCRIPTIONS, CONFIDENCE_LABELS } from "@/types/student-success";
import type { StudentSuccessSign, CreateStudentSuccessSign } from "@/types/student-success";

interface AddStudentSuccessSignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
}

export const AddStudentSuccessSignDialog = ({
  open,
  onOpenChange,
  studentId,
  studentName
}: AddStudentSuccessSignDialogProps) => {
  const [formData, setFormData] = useState<Partial<CreateStudentSuccessSign>>({
    student_id: studentId,
    sign_type: 'engagement',
    confidence_level: 3,
    detection_method: 'manual'
  });

  const createMutation = useCreateStudentSuccessSign();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.sign_type) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        student_id: studentId,
        sign_type: formData.sign_type,
        description: formData.description,
        evidence_text: formData.evidence_text,
        confidence_level: formData.confidence_level || 3,
        detection_method: 'manual'
      });
      
      // Reset form and close dialog
      setFormData({
        student_id: studentId,
        sign_type: 'engagement',
        confidence_level: 3,
        detection_method: 'manual'
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create success sign:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      student_id: studentId,
      sign_type: 'engagement',
      confidence_level: 3,
      detection_method: 'manual'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Student Success Sign</DialogTitle>
          <p className="text-sm text-gray-600">
            Record a positive success sign for {studentName}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div>
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you observed..."
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence_text">Evidence/Quote (Optional)</Label>
            <Textarea
              id="evidence_text"
              placeholder="Specific quote or evidence that supports this observation..."
              value={formData.evidence_text || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, evidence_text: e.target.value }))}
              rows={2}
            />
          </div>

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
                    {label}
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
              {createMutation.isPending ? 'Adding...' : 'Add Success Sign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};