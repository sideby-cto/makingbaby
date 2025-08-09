import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Brain, MessageSquare, Lightbulb, Target } from "lucide-react";
import { useStudentSuccessSigns } from "@/hooks/useStudentSuccessSigns";
import { SIGN_TYPE_LABELS, CONFIDENCE_LABELS } from "@/types/student-success";
import { AddStudentSuccessSignDialog } from "./AddStudentSuccessSignDialog";
import { useState } from "react";

interface StudentSuccessSignsSummaryProps {
  studentId: string;
  studentName: string;
}

const getSignIcon = (signType: string) => {
  switch (signType) {
    case 'persistence':
      return <Target className="h-3 w-3" />;
    case 'engagement':
      return <TrendingUp className="h-3 w-3" />;
    case 'comprehension':
      return <Brain className="h-3 w-3" />;
    case 'participation':
      return <MessageSquare className="h-3 w-3" />;
    case 'collaboration':
      return <Users className="h-3 w-3" />;
    case 'creativity':
      return <Lightbulb className="h-3 w-3" />;
    default:
      return <TrendingUp className="h-3 w-3" />;
  }
};

const getConfidenceColor = (level: number) => {
  switch (level) {
    case 1:
    case 2:
      return 'bg-red-100 text-red-700 border-red-200';
    case 3:
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 4:
    case 5:
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const StudentSuccessSignsSummary = ({ studentId, studentName }: StudentSuccessSignsSummaryProps) => {
  const { data: signs = [], isLoading } = useStudentSuccessSigns(studentId);
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Student Success Signs</h4>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const recentSigns = signs.slice(0, 3);
  const signsByType = signs.reduce((acc, sign) => {
    acc[sign.sign_type] = (acc[sign.sign_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          Student Success Signs
        </h4>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Add Sign
        </Button>
      </div>

      {signs.length === 0 ? (
        <div className="text-sm text-gray-500 py-3 px-4 bg-gray-50 rounded-md border border-gray-100">
          No success signs recorded yet. Add the first one!
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-green-50 rounded-md border border-green-100">
              <div className="text-lg font-semibold text-green-700">{signs.length}</div>
              <div className="text-xs text-green-600">Total Signs</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-md border border-blue-100">
              <div className="text-lg font-semibold text-blue-700">{Object.keys(signsByType).length}</div>
              <div className="text-xs text-blue-600">Sign Types</div>
            </div>
          </div>

          {/* Recent Signs */}
          <div className="space-y-2">
            {recentSigns.map((sign) => (
              <Card key={sign.id} className="p-3 bg-white border border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        {getSignIcon(sign.sign_type)}
                        {SIGN_TYPE_LABELS[sign.sign_type]}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(sign.confidence_level)}`}
                      >
                        {CONFIDENCE_LABELS[sign.confidence_level]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{sign.description}</p>
                    {sign.evidence_text && (
                      <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">
                        "{sign.evidence_text}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(sign.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>

          {signs.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              Showing {recentSigns.length} of {signs.length} signs
            </div>
          )}
        </div>
      )}

      <AddStudentSuccessSignDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        studentId={studentId}
        studentName={studentName}
      />
    </div>
  );
};