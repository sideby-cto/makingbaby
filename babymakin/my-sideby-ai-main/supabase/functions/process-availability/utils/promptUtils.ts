/**
 * Determine the time scope and days to include based on pacing level
 */ export function determineTimeScope(pacingLevel) {
  let timeScope = "next two weeks";
  let daysToInclude = 14;
  if (pacingLevel) {
    switch(pacingLevel){
      case "light":
        timeScope = "next month";
        daysToInclude = 30;
        break;
      case "moderate":
        timeScope = "next two weeks";
        daysToInclude = 14;
        break;
      case "consistent":
        timeScope = "next week";
        daysToInclude = 7;
        break;
      case "deep_dive":
        timeScope = "next few days";
        daysToInclude = 5;
        break;
    }
  }
  return {
    timeScope,
    daysToInclude
  };
}
/**
 * Build the prompt for the OpenAI API
 */ export function buildPrompt(availabilityText, imageUrl, timeScope) {
  let prompt = `I need help scheduling sideby learning sessions. ${imageUrl ? "I've attached a screenshot of my calendar. " : ""}`;
  prompt += `Based on ${availabilityText ? "my description" : "the calendar image"}, please identify 5 potential 18-minute time slots when I'm available in the ${timeScope}.`;
  if (availabilityText) {
    prompt += `\n\nMy availability: ${availabilityText}`;
  }
  prompt += `\n\nPlease return your response as a JSON array of objects with day, startTime, and endTime properties. 
  Format the time slots like this:
  [
    {
      "day": "Monday, March 4th",
      "startTime": "9:00 AM",
      "endTime": "9:18 AM"
    }
  ]`;
  return prompt;
}
