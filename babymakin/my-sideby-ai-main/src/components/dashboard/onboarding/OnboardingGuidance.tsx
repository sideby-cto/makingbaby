import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Users, Clock, Phone, Heart } from 'lucide-react';
import type { OnboardingStatus } from '@/hooks/useOnboardingStatus';

interface OnboardingGuidanceProps {
  onboardingStatus: OnboardingStatus;
}

export const OnboardingGuidance: React.FC<OnboardingGuidanceProps> = ({
  onboardingStatus
}) => {
  const navigate = useNavigate();

  const steps = [
    {
      id: 'values',
      title: 'Acknowledge Values',
      description: 'Review and acknowledge our community values',
      icon: Heart,
      completed: onboardingStatus.hasValuesAcknowledgment,
      path: '/values'
    }
  ];

  const currentStepIndex = steps.findIndex(step => !step.completed);
  const currentStep = currentStepIndex !== -1 ? steps[currentStepIndex] : null;

  const handleContinueOnboarding = () => {
    if (onboardingStatus.nextStep === 'values') {
      navigate('/values');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {currentStep && <currentStep.icon className="h-6 w-6 text-primary" />}
            </div>
            <div>
              <CardTitle className="text-xl">Complete Your Setup</CardTitle>
              <p className="text-muted-foreground">
                Finish setting up your account to start your learning journey
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep?.id;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${
                        isActive ? 'text-primary' : step.completed ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </h3>
                      {step.completed && (
                        <Badge variant="secondary" className="text-xs">
                          Complete
                        </Badge>
                      )}
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <ArrowRight className="h-4 w-4 text-primary" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          {currentStep && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleContinueOnboarding}
                size="lg"
                className="px-8"
              >
                Continue Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};