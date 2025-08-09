import { getUpduoToken } from "../../_shared/upduo_auth.ts";
const UPDUO_API_URL = "https://api.upduo.com/api/graphql";
/**
 * Fetch transcript data for a conversation from Upduo API
 */ export async function fetchTranscript(conversationId, token) {
  try {
    const token = await getUpduoToken();
    console.log("Fetching transcript for conversation:", conversationId);
    const response = await fetch(`${UPDUO_API_URL}?org_id=org_rdpDlfhGHCB4ZQEY`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
            query GetSessionDetails($sessionId: ID!) {
              session(id: $sessionId) {
                id
                createdAt
                duration
                type
                users {
                  id
                  firstName
                  lastName
                  email
                }
                knowledgeNodes {
                  id
                  name
                  tags {
                    id
                    contentTag {
                      id
                      name
                    }
                  }
                }
                transcriptContents {
                  speaker
                  text
                  startTime
                  endTime
                }
              }
            }
          `,
        variables: {
          sessionId: conversationId
        }
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // Check for GraphQL errors
    if (data.errors) {
      const errorMessage = data.errors[0]?.message || JSON.stringify(data.errors);
      throw new Error(`GraphQL errors: ${errorMessage}`);
    }
    return data;
  } catch (error) {
    // Check if the error is related to JWT token
    const errorStr = String(error);
    console.error("Error fetching transcript:", error);
    throw error;
  }
}
