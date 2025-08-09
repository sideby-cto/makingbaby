import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SessionCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstReflection?: boolean;
  partnerName?: string;
  showMatchNotification?: boolean;
}

export const SessionCompletionDialog: React.FC<SessionCompletionDialogProps> = ({
  isOpen,
  onClose,
  isFirstReflection = false,
  partnerName,
  showMatchNotification = false
}) => {
  const navigate = useNavigate();

  const handleViewPartners = () => {
    onClose();
    navigate('/dashboard?tab=partners');
  };

  const handleContinue = () => {
    onClose();
    navigate('/dashboard');
  };

  const getTitle = () => {
    if (isFirstReflection && showMatchNotification) {
      return "Reflection Complete & Match Found!";
    }
    if (isFirstReflection) {
      return "Great Job on Your First Reflection!";
    }
    return "Session Complete!";
  };

  const getDescription = () => {
    if (isFirstReflection && showMatchNotification) {
      return `Congratulations! You've completed your first reflection and we've matched you with ${partnerName || 'a team member'}. You can now connect with your learning partner to schedule your first conversation.`;
    }
    if (isFirstReflection) {
      return "You've successfully completed your first reflection session. We're finding you a great learning partner to connect with.";
    }
    return "You've successfully completed your session. Great work!";
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              {getTitle()}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            {getDescription()}
          </p>

          {showMatchNotification && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">New Learning Partner</span>
              </div>
              <p className="text-sm text-blue-800">
                Check your Partners tab to see your new match and start scheduling your first conversation together.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {showMatchNotification ? (
              <>
                <Button
                  onClick={handleViewPartners}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Partners
                </Button>
                <Button
                  onClick={handleContinue}
                  variant="outline"
                  className="flex-1"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <Button
                onClick={handleContinue}
                className="w-full"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue to Dashboard
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};