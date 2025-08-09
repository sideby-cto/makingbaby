import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Info, Shield, Users, Brain, ArrowRight } from 'lucide-react';

interface UpduoPreparationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  isLoading?: boolean;
}

export const UpduoPreparationDialog: React.FC<UpduoPreparationDialogProps> = ({
  isOpen,
  onClose,
  onContinue,
  isLoading = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Your sideby Reflection
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Before we begin, here's what you need to know about the reflection process
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upduo Introduction Section */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">U</span>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-xl text-primary">Upduo</h3>
                  <p className="text-sm text-muted-foreground">
                    Upduo is the tool sideby uses to map learning and facilitate our conversations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Creation Section */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Account Creation</h3>
          <p className="text-muted-foreground mb-3">
            You can create a free account using the same email as your sideby account.
          </p>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>Seamless setup process</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Permissions Section */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Privacy & Permissions</h3>
                  <p className="text-muted-foreground mb-3">
                    Your video reflection will be processed to help us match you with compatible learning partners.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span>Camera and microphone access required</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span>Transcription used only for matching purposes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span>Your privacy is protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matching Process Section */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Smart Matching Algorithm</h3>
                  <p className="text-muted-foreground mb-4">
                    Your reflection is the first datapoint we get about who you are and what you're ready to learn.
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2 text-foreground">Beyond job-alike, matching criteria include:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span><strong>Primary flow activity:</strong> Skiers have shorthand with other skiers. Runners with runners. Painters with painters.</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span><strong>Expertise areas:</strong> Complementary skills where you can teach and learn from each other</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span><strong>Interest areas:</strong> Sometimes we're both learning something similar at the same time.</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span><strong>AI magic:</strong> Matching is something we're working to become world class at. It should keep getting better.</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Privacy Note:</strong> sideby only accesses the transcripts, not the video. No need to comb your hair.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What to Expect Section */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <Info className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">What to Expect</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-amber-600" />
                      <span>You'll be prompted to record a 2-3 minute video introduction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-amber-600" />
                      <span>Share what you'd like to teach and learn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-amber-600" />
                      <span>Be yourself - authenticity helps with better matches</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-amber-600" />
                      <span>Processing takes a few minutes after recording</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Starting...
              </>
            ) : (
              <>
                Start Reflection
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};