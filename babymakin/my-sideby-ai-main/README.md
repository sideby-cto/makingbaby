
# sideby.ai Platform

A platform for connecting educators for meaningful learning partnerships.

## Version 0.2.0

This release focuses on making the project easily downloadable and installable for local development.

## Local Development Setup

### Prerequisites

- Node.js v18+
- npm v8+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for database migrations)
- Git

### Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/my-sideby-ai.git
   cd my-sideby-ai
   ```

2. Run the setup script
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. Update your `.env` file with the appropriate API keys and secrets

4. Start the development server
   ```bash
   ./dev.sh
   ```

5. Visit `http://localhost:8080` in your browser

### Manual Setup

If the automated setup doesn't work for you:

1. Copy `.env.example` to `.env` and fill in your API keys
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`

## Environment Variables

All required environment variables are documented in `.env.example`. Make sure to set these in your local `.env` file or in your deployment environment.

### Important Configuration Notes

- **Supabase configuration:** The application connects to Supabase for backend functionality. You'll need to configure your Supabase project and update the relevant environment variables.

- **Resend API key:** Used for sending emails, including calendar invitations.

- **Package.json configuration:** The project uses Vite as the build tool with specific scripts for development, building, and testing. You'll find these in the package.json file:
  - `npm run dev` - Start development server
  - `npm run build` - Build for production

## Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # React hooks
│   ├── integrations/       # Third-party integrations
│   ├── lib/                # Utility libraries
│   ├── pages/              # Page components
│   ├── services/           # Service modules
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database migrations
```

## Features

- User authentication and profile management
- Match creation and management
- Scheduling system with calendar integration
- Notification system
- Communication tools
- Comment on ideas saved in your collection

## Database Schema

The core database schema is provided in `main_schema.sql`. This includes all the necessary tables and security policies for the application.

## Supabase Edge Functions

The project uses several Supabase Edge Functions for server-side functionality:

- `send-calendar-invite` - Sends calendar invitations to matched users
- `process-notification-digests` - Processes notification digests
- And others

These functions are automatically deployed with the Supabase project.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the terms specified in the LICENSE file.
