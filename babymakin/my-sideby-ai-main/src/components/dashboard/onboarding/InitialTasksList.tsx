import React, { useState } from 'react';
import { useInitialTasksData } from './hooks/useInitialTasksData';
import { TaskStatusMessage } from './components/TaskStatusMessage';
import { UpduoReflectionTask } from './components/UpduoReflectionTask';
import { FindTimeTask } from './components/FindTimeTask';
import { OnboardingGuidance } from './OnboardingGuidance';
import { HelpDialog } from '@/components/help';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import type { JourneyData } from "@/hooks/user-journey/types";
import { motion } from "framer-motion";
import { CheckCircle, PartyPopper } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
interface InitialTasksListProps {
  userId: string;
  journeyData: JourneyData | undefined;
}
export const InitialTasksList: React.FC<InitialTasksListProps> = ({
  userId,
  journeyData
}) => {
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [showCaughtUpMessage, setShowCaughtUpMessage] = useState(false);
  const onboardingStatus = useOnboardingStatus(userId);
  const {
    videoOpen,
    videoFinished,
    hasCompletedReflection,
    hasActiveMatch,
    activeMatchId,
    suggestedCompletion,
    profileData,
    sessionData,
    handleGoToToolbox,
    handleWatchVideo,
    handleVideoEnded,
    handleCloseVideo,
    handleGoToChat
  } = useInitialTasksData(userId, journeyData);
  const openHelpDialog = () => {
    setHelpDialogOpen(true);
  };
  const handleShowCaughtUpMessage = () => {
    setShowCaughtUpMessage(true);
  };
  if (showCaughtUpMessage && hasCompletedReflection && !hasActiveMatch) {
    const flowActivity = profileData?.approved_flow_activity || 'exploring new activities';
    return <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4
    }}>
        <Card className="border-2 border-green-200 overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <PartyPopper className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">You're all caught up!</h2>
            <p className="text-lg text-gray-700 max-w-lg mx-auto mb-6">
              There's nothing else to do right now. Have fun, maybe go do something outside, or the next thing on your to-do list.
            </p>
            <div className="inline-flex items-center text-green-600 font-medium">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>All tasks completed</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>;
  }
  // Show onboarding guidance if onboarding is not complete
  if (!onboardingStatus.loading && !onboardingStatus.isOnboardingComplete) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-semibold mb-2">Welcome to sideby!</h2>
          <p className="text-gray-600">Let's get you set up to start your learning journey.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <OnboardingGuidance onboardingStatus={onboardingStatus} />
        </motion.div>

        <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />
      </div>
    );
  }

  return <div className="space-y-6">
      <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4
    }} className="space-y-2">
        <h2 className="text-xl font-semibold mb-2">Welcome to sideby!</h2>
        <p className="text-gray-600">This is your task list. It's short, but impactful.</p>
      </motion.div>

      <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4,
      delay: 0.2
    }}>
        {hasCompletedReflection && hasActiveMatch ? <FindTimeTask activeMatchId={activeMatchId} suggestedCompletion={suggestedCompletion} onHelp={openHelpDialog} onFinished={() => {}} /> : <UpduoReflectionTask hasCompletedReflection={hasCompletedReflection} hasActiveMatch={hasActiveMatch} videoOpen={videoOpen} videoFinished={videoFinished} suggestedCompletion={suggestedCompletion} profileData={profileData} sessionData={sessionData} onWatchVideo={handleWatchVideo} onVideoEnded={handleVideoEnded} onCloseVideo={handleCloseVideo} onGoToToolbox={handleGoToToolbox} onHelp={openHelpDialog} onShowCaughtUpMessage={handleShowCaughtUpMessage} onGoToChat={handleGoToChat} />}
      </motion.div>
      
      <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4,
      delay: 0.3
    }}>
        <TaskStatusMessage hasCompletedReflection={hasCompletedReflection} hasActiveMatch={hasActiveMatch} approvedFlowActivity={profileData?.approved_flow_activity} />
      </motion.div>
      
      <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />
    </div>;
};
