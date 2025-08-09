
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { BugReportTab } from "./tabs/BugReportTab";
import { ContactTab } from "./tabs/ContactTab";
import { ValuesTab } from "./tabs/ValuesTab";
import { FeatureRequestTab } from "./tabs/FeatureRequestTab";
import { HelpType } from "./types";

interface HelpDialogContentProps {
  type: HelpType;
  details: string;
  featureDescription: string;
  useCase: string;
  priority: string;
  isSubmitting: boolean;
  setDetails: (value: string) => void;
  setFeatureDescription: (value: string) => void;
  setUseCase: (value: string) => void;
  setPriority: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const HelpDialogContent: React.FC<HelpDialogContentProps> = ({
  type,
  details,
  featureDescription,
  useCase,
  priority,
  isSubmitting,
  setDetails,
  setFeatureDescription,
  setUseCase,
  setPriority,
  onSubmit,
  onClose
}) => {
  return (
    <div className="h-full flex flex-col">
      <TabsContent value="bug" className="flex-1 m-0 data-[state=inactive]:hidden">
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm h-full overflow-y-auto p-4 sm:p-6">
          <BugReportTab 
            details={details}
            setDetails={setDetails}
            submitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </div>
      </TabsContent>

      <TabsContent value="contact" className="flex-1 m-0 data-[state=inactive]:hidden">
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm h-full overflow-y-auto p-4 sm:p-6">
          <ContactTab 
            details={details}
            setDetails={setDetails}
            submitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </div>
      </TabsContent>

      <TabsContent value="feature-request" className="flex-1 m-0 data-[state=inactive]:hidden">
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm h-full overflow-y-auto">
          <FeatureRequestTab
            featureDescription={featureDescription}
            setFeatureDescription={setFeatureDescription}
            useCase={useCase}
            setUseCase={setUseCase}
            priority={priority}
            setPriority={setPriority}
            submitting={isSubmitting}
            onSubmit={onSubmit}
            onClose={onClose}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="faqs" className="flex-1 m-0 data-[state=inactive]:hidden">
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm h-full overflow-y-auto">
          <ValuesTab />
        </div>
      </TabsContent>
    </div>
  );
};
