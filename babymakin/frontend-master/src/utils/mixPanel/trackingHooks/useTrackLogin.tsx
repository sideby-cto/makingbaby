import { useEffect } from "react";
import querystring from "query-string";
import { DecodeToken } from "../../functions";
import { MixPanel } from "../mixPanel";
import { EventNames } from "../trackUtils";

// The below use effect was added to track when users login to the application.
// On initial login, a token should exist in the URL. The below checks for the presence
// of this token, and if it exists & is associated with a user, a login event is triggered.

export const useTrackLogin = (queryToken: querystring.ParsedQuery<string>) => {
  const userIdData = queryToken.token
    ? DecodeToken(queryToken.token as string)
    : null;

  useEffect(() => {
    if (userIdData?.sub) {
      MixPanel.identify(userIdData.sub);
      MixPanel.track(EventNames.userLoggedIn);
    }
  }, []);
};
