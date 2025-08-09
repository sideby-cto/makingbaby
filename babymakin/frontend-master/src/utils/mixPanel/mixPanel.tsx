import mixpanel from "mixpanel-browser";
import { EventNames } from "./trackUtils";

mixpanel.init(process.env.REACT_APP_MIXPANEL_TRACKING_TOKEN || "", {
  track_pageview: false,
});

const enableTracking = process.env.REACT_APP_ENABLE_EVENT_TRACKING === "true";

let actions = {
  identify: (userId: string) => {
    if (enableTracking) mixpanel.identify(userId);
  },

  track: (eventName: EventNames, props?: {}) => {
    if (enableTracking) mixpanel.track(eventName, props);
  },
};

export let MixPanel = actions;
