import { useEffect } from "react";
import { MixPanel } from "../mixPanel";
import { EventNames } from "../trackUtils";

interface usePageViewedProps {
  location: string;
}

export const usePageViewed = ({ location }: usePageViewedProps) => {
  useEffect(() => {
    MixPanel.track(EventNames.pageViewed, { pageUrl: location });

// this is redundant, but it will make it simpler to craft queries in MixPanel to have a specific event for when stories are GetStartedCallToAction.
    if ( location.includes("/create-story") ) MixPanel.track( EventNames.storyStarted );

  }, [location]);
};
