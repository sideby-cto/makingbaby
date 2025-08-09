
import React from "react";
import { usePersonalIdeas } from "./hooks/usePersonalIdeas";
import { useSavedIdeas } from "./hooks/useSavedIdeas";
import SimplifiedIdeasView from "./SimplifiedIdeasView";
import IdeasView from "./IdeasView";
import { EmptyIdeasState } from "./EmptyIdeasState";

interface ReflectedInsightsGalleryProps {
  userId: string;
}

const ReflectedInsightsGallery = ({ userId }: ReflectedInsightsGalleryProps) => {
  
  console.log('ReflectedInsightsGallery: Rendering with userId:', userId);
  
  // Use the simplified view by default
  if (!userId) {
    console.log('ReflectedInsightsGallery: No userId provided');
    return (
      <div className="flex justify-center py-8">
        <p className="text-red-500">User ID is required to display ideas.</p>
      </div>
    );
  }

  console.log('ReflectedInsightsGallery: Rendering ideas view');

  return (
    <div className="space-y-6">
      {/* Always show simplified view */}
      <SimplifiedIdeasView userId={userId} />
    </div>
  );
};

export default ReflectedInsightsGallery;
