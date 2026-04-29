# LocalAI API Platform

A full-featured local AI API management dashboard built with Next.js, Prisma, and SQLite. Manage API keys, monitor usage, and interact with local Ollama models.

## Features

✨ **Dashboard Analytics**
- Real-time API usage statistics
- Token consumption charts
- Request tracking
- Recent activity logs

🔑 **API Key Management**
- Generate secure API keys
- Set per-key token limits
- Track requests and usage
- Enable/disable keys
- Reset statistics

📊 **Usage Logs**
- Paginated log table
- Filter by date, model, and API key
- Full search capabilities
- Token usage breakdown

🤖 **Model Management**
- List installed Ollama models
- Set default model
- Test models with custom prompts
- Monitor model health

⚙️ **Settings**
- Configure rate limits
- Set global token caps
- Auto-disable abused keys
- Default model selection

🔐 **Authentication**
- Secure session-based auth
- Demo credentials included
- Protected routes

## Tech Stack

- **Next.js** - App Router, TypeScript
- **React** - UI framework
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Prisma** - ORM
- **SQLite** - Database
- **Recharts** - Analytics charts
- **Lucide React** - Icons
- **Zod** - Validation
- **Bcrypt** - Password hashing

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Ollama running locally on `http://localhost:11434`

### Installation

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# (Optional) Seed database with default user
npx prisma db seed
```

### Running the Application

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

The application will be available at `http://localhost:3000`

## Demo Credentials

```
Username: notshubham
Password: 1112
```

## Color Theme

The application uses an elegant grayscale color scheme with blue accents:

- **Primary Text**: #FFFFFF (white)
- **Secondary Text**: #94a3b8 (slate-400)
- **Background**: #0f172a (slate-900)
- **Cards**: #1e293b (slate-800)
- **Accent**: #0057FF (blue)

## API Usage

### Authentication

All API requests require a Bearer token:

```bash
Authorization: Bearer sk_local_xxxxxxxxxxxxx
```

### Chat Endpoint

**POST** `/api/v1/chat`

Request:
```json
{
  "model": "llama2",
  "prompt": "What is machine learning?"
}
```

Response:
```json
{
  "success": true,
  "model": "llama2",
  "output": "...",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}
```

### Example Usage

```bash
# Create an API key first in the dashboard

# Test the chat endpoint
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Authorization: Bearer sk_local_xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, how are you?"
  }'
```

## Database Schema

### User
```prisma
- id: String (cuid)
- username: String (unique)
- passwordHash: String
- createdAt: DateTime
```

### ApiKey
```prisma
- id: String (cuid)
- name: String
- key: String (unique)
- isActive: Boolean
- tokenLimit: Int? (nullable)
- requestsCount: Int
- tokensUsed: Int
- lastUsedAt: DateTime?
- createdAt: DateTime
```

### UsageLog
```prisma
- id: String (cuid)
- apiKeyId: String (FK)
- promptTokens: Int
- completionTokens: Int
- totalTokens: Int
- model: String
- endpoint: String
- createdAt: DateTime
```

### Settings
```prisma
- id: String
- defaultModel: String
- maxRequestsPerMinute: Int
- globalTokenCap: Int? (nullable)
- autoDisableAbuseKeys: Boolean
- updatedAt: DateTime
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="your-secret-key-change-in-production"
OLLAMA_API_URL="http://localhost:11434"
```

## File Structure

```
app/
├── api/
│   ├── auth/              # Authentication endpoints
│   ├── api-keys/          # API key management
│   ├── usage-logs/        # Usage log queries
│   ├── ollama/            # Ollama integration
│   ├── settings/          # Settings management
│   └── v1/
│       └── chat/          # Main chat endpoint
├── login/                 # Login page
├── dashboard/             # Protected dashboard
│   ├── page.tsx          # Overview
│   ├── api-keys/         # Key management page
│   ├── usage/            # Usage logs page
│   ├── models/           # Model management page
│   └── settings/         # Settings page
├── layout.tsx
└── page.tsx              # Root redirect

components/
├── dashboard/
│   ├── navbar.tsx        # Navigation bar
│   ├── chart.tsx         # Chart component
│   ├── api-keys-client.tsx    # API keys UI
│   ├── usage-logs-client.tsx  # Usage logs UI
│   ├── models-client.tsx      # Models UI
│   └── settings-client.tsx    # Settings UI
└── ui/                   # shadcn/ui components

lib/
├── auth.ts              # Session management
├── db.ts                # Database helpers
├── utils-auth.ts        # Auth utilities
└── utils.ts             # General utilities

prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Seed script
```

## Key Features Explained

### API Key Generation

Keys are generated in the format: `sk_local_xxxxxxxxxxxxxxxx`

Each key tracks:
- Requests count
- Tokens used
- Last used timestamp
- Optional token limit

### Rate Limiting

- Per-minute rate limits per API key (default: 60 requests/min)
- Global token caps to prevent excessive usage
- Automatic key disablement on abuse

### Usage Tracking

Every request to `/api/v1/chat` logs:
- Prompt tokens (estimated from character count ÷ 4)
- Completion tokens (estimated from response length ÷ 4)
- Model used
- Timestamp

### Ollama Integration

The platform directly integrates with your local Ollama instance:
- Fetches available models
- Tests models with sample prompts
- Measures latency and token usage
- Routes requests to specified models

## Security Considerations

✅ **Implemented:**
- Passwords hashed with bcrypt
- Session-based authentication
- API key validation on every request
- Input validation with Zod
- Protected dashboard routes
- Rate limiting

⚠️ **For Production:**
- Change `AUTH_SECRET` in `.env`
- Use HTTPS only
- Implement CORS if exposing to other domains
- Add more sophisticated rate limiting
- Use a production-grade database
- Enable request signing

## Troubleshooting

### Ollama Offline

If Ollama is offline:
1. Ensure Ollama is running: `ollama serve`
2. Check the connection at `http://localhost:11434/api/tags`
3. The dashboard will show an offline warning

### No Models Available

1. Pull models: `ollama pull llama2`
2. List models: `ollama list`
3. Refresh the models page

### API Key Not Working

1. Verify the key is active in the dashboard
2. Check the Authorization header format: `Bearer sk_local_...`
3. Ensure the key hasn't exceeded token limits
4. Check rate limit hasn't been exceeded

## Development

```bash
# Run type checking
npm run typecheck

# Format code
npm run format

# Run linter
npm run lint

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## License

This project is provided as-is for personal use.

## Support

For issues or questions:
1. Check the dashboard status indicators
2. Review Ollama logs
3. Check database in Prisma Studio: `npx prisma studio`
4. Review API logs in the browser console

---

**Made with ❤️ for local AI development**
