import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const CHATTERBOX_API_ENDPOINT = process.env.CHATTERBOX_API_ENDPOINT;
const CHATTERBOX_API_KEY = process.env.CHATTERBOX_API_KEY;

if (!CHATTERBOX_API_ENDPOINT || !CHATTERBOX_API_KEY) {
  process.stderr.write(JSON.stringify({
    level: "error",
    message: "Error: CHATTERBOX_API_ENDPOINT and CHATTERBOX_API_KEY environment variables are required"
  }) + "\n");
  process.exit(1);
}

interface ToolResponse {
  [key: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
  _meta?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

/**
 * Unified error handler for API calls
 */
function handleApiError(error: unknown, context: string): ToolResponse {
    console.error(`Error in ${context}:`, error);
    
    if (error instanceof Error) {
        return {
            content: [{ type: "text", text: `An unexpected error occurred: ${error.message}` }],
            isError: true,
            _meta: {
                errorCode: "UNKNOWN_ERROR",
                errorMessage: error.message
            }
        };
    }
    
    return {
        content: [{ type: "text", text: "An unexpected error occurred" }],
        isError: true,
        _meta: {
            errorCode: "UNKNOWN_ERROR",
            errorMessage: "Unknown error occurred"
        }
    };
}

// Create server instance
const server = new McpServer({
  name: "chatterbox",
  version: "1.0.0",
  capabilities: {
    tools: {},
    resources: {},
  },
});

// Register tools
server.tool(
  "joinMeeting",
  "Join a Zoom or Google Meet meeting using the provided meeting ID and password and capture transcript and audio recording",
  {
    platform: z.enum(["zoom", "googlemeet"]).describe("The online conference platform (zoom or googlemeet)"),
    meetingId: z.string().describe("The ID of the Zoom ('###########') or Google Meet ('xxx-xxx-xxx') meeting"),
    meetingPassword: z.string().optional().describe("The password for the Zoom meeting (optional)"),
    botName: z.string().describe("The name of the bot"),
    webhookUrl: z.string().optional().describe("URL to receive webhook events for meeting status (optional)"),
  },
  async ({ platform, meetingId, meetingPassword, botName, webhookUrl }) => {
    try {
      const response = await fetch(
        `${CHATTERBOX_API_ENDPOINT}/join`,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CHATTERBOX_API_KEY}`
          },
          body: JSON.stringify({
            platform,
            meetingId,
            meetingPassword: meetingPassword || '',
            botName: botName || '',
            webhookUrl: webhookUrl || ''
          })
        }
      );

      const data = await response.json();

      return {
        content: [{ type: "text", text: `Meeting joined successfully. Session ID: ${data.sessionId}` }]
      };
    } catch (error) {
      return handleApiError(error, "joinMeeting");
    }
  }
);

server.tool(
  "getMeetingInfo",
  "Get information about a meeting",
  {
    sessionId: z.string().describe("The session ID to get information for"),
  },
  async ({ sessionId }) => {
    try {
      const response = await fetch(
        `${CHATTERBOX_API_ENDPOINT}/session/${sessionId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CHATTERBOX_API_KEY}`
          }
        }
      );

      const data = await response.json();
      if(data.message) {
        return {
          content: [{ type: "text", text: data.message }],
          isError: true,
          _meta: { errorCode: "UNKNOWN_ERROR", errorMessage: data.message }
        };
      }

      let transcript = "";
      if(data.transcript) {
        transcript = data.transcript.map((utterance: any) => 
          `${utterance.speaker}: ${utterance.text}`
        ).join('\n');
      } else {
        transcript = "No transcript data available";
      }

      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            recordingLink: data.recordingLink,
            startTime: data.startTimestamp,
            endTime: data.endTimestamp,
            transcript: transcript
          })
        }]
      };
    } catch (error) {
      return handleApiError(error, "getMeetingInfo");
    }
  }
);

server.tool(
  "summarizeMeeting",
  "Generate a concise summary of a meeting's contents from its transcript",
  {
    transcript: z.string().describe("The meeting transcript to summarize"),
  },
  async ({ transcript }) => {
    return {
      content: [{
        type: "text",
        text: `Given an online call transcript formatted as:
Speaker: Transcript

Identify main topics of the conversation, summarize them in the following format:
- Topic Title
Topic summary

Remove smalltalk and insignificant topics. Do not include any introductory wording.

Transcript:
${transcript}`
      }]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);