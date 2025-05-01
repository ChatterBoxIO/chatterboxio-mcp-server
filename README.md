# ChatterBox MCP Server
[![smithery badge](https://smithery.ai/badge/@OverQuotaAI/chatterboxio-mcp-server)](https://smithery.ai/server/@OverQuotaAI/chatterboxio-mcp-server)

A Model Context Protocol server implementation for ChatterBox, enabling AI agents to interact with online meetings and generate meeting summaries.

<a href="https://glama.ai/mcp/servers/@OverQuotaAI/chatterboxio-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@OverQuotaAI/chatterboxio-mcp-server/badge" alt="ChatterBox Server MCP server" />
</a>

## Overview

The ChatterBox MCP Server provides tools for AI agents to:

- Join online meetings (Zoom and Google Meet)
- Capture transcripts and recordings
- Generate meeting summaries

## Installation

### Installing via Smithery

To install chatterboxio-mcp-server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@OverQuotaAI/chatterboxio-mcp-server):

```bash
npx -y @smithery/cli install @OverQuotaAI/chatterboxio-mcp-server --client claude
```

### Manual Installation
You can install the dependencies using either npm or pnpm:

```bash
# Using npm
npm install

# Using pnpm
pnpm install
```

## Configuration

### Getting API Keys

You can get your API keys for free by registering on our website at [ChatterBox](https://chatter-box.io). After registration, you'll receive your API endpoint and key.

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
CHATTERBOX_API_ENDPOINT=https://api.chatter-box.io
CHATTERBOX_API_KEY=your_api_key_here
```

## Usage

### Starting the Server

```bash
npm start
```

### Available Tools

#### joinMeeting

Join a Zoom or Google Meet meeting and capture transcript and audio recording.

**Parameters:**

- `platform` (string): The online conference platform ("zoom" or "googlemeet")
- `meetingId` (string): The ID of the meeting
- `meetingPassword` (string, optional): The password for the meeting
- `botName` (string): The name of the bot
- `webhookUrl` (string, optional): URL to receive webhook events for meeting status

#### getMeetingInfo

Get information about a meeting, including transcript and recording.

**Parameters:**

- `sessionId` (string): The session ID to get information for

#### summarizeMeeting

Generate a concise summary of a meeting's contents from its transcript.

**Parameters:**

- `transcript` (string): The meeting transcript to summarize

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Building

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please visit [ChatterBox Documentation](https://chatter-box.io/documentation) or contact support@chatter-box.io.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.