/**
 * Call the OpenAI API to process the availability
 */ export async function callOpenAI(messages, apiKey) {
  if (!apiKey) {
    throw new Error("Missing OpenAI API key");
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4.1-2025-04-14",
      max_tokens: 1000,
      messages
    })
  });
  if (!response.ok) {
    const error = await response.json();
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
  }
  return await response.json();
}
/**
 * Parse the OpenAI response to extract time slots
 */ export function parseTimeSlots(text) {
  try {
    // First, try to find a JSON block in the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      // Parse the JSON content
      const jsonContent = jsonMatch[1] || jsonMatch[0];
      const parsedSlots = JSON.parse(jsonContent);
      // Validate the structure
      if (Array.isArray(parsedSlots) && parsedSlots.length > 0 && parsedSlots.every((slot)=>typeof slot.day === 'string' && typeof slot.startTime === 'string' && typeof slot.endTime === 'string')) {
        return parsedSlots;
      }
    }
    // If no valid JSON found, try a manual approach
    console.log("No valid JSON found in response, trying manual parsing");
    // Create a simple parser for time slots
    const timeSlots = [];
    const lines = text.split('\n');
    let currentDay = null;
    for (const line of lines){
      // Look for day headers
      const dayMatch = line.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Today|Tomorrow)\b,?\s*([\w\s]+)?/i);
      if (dayMatch) {
        currentDay = dayMatch[0].trim();
        continue;
      }
      // Look for time ranges if we have a current day
      if (currentDay) {
        const timeMatch = line.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–—to]+\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          timeSlots.push({
            day: currentDay,
            startTime: `${timeMatch[1]}:${timeMatch[2]} ${timeMatch[3]}`,
            endTime: `${timeMatch[4]}:${timeMatch[5]} ${timeMatch[6]}`
          });
        }
      }
    }
    if (timeSlots.length > 0) {
      return timeSlots;
    }
    // If all parsing fails, return null to trigger fallback
    throw new Error("Could not parse time slots from response");
  } catch (error) {
    console.error("Error parsing time slots:", error);
    throw error;
  }
}
