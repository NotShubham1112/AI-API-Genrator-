# 👨‍💻 AI API Generator Platform

**Created by Shubham Kambli**

Founder of COSMIC • AI Engineer • Open-Source Builder

19-year-old Founder of COSMIC, AI engineer, and open-source builder creating production-ready tools at the intersection of artificial intelligence and software engineering

🌐 [shubhamkambli.com](https://shubhamkambli.com) • 📧 shubhamkambli1112@gmail.com • [💼 LinkedIn](https://linkedin.com) • [🐦 @Not_Shubham_111](https://twitter.com)

---

## 🚀 Project Overview

A full-featured local AI API management dashboard built with Next.js, Prisma, and SQLite. Manage API keys, monitor usage, generate APIs, and interact with local Ollama models—all in one elegant, production-ready platform.

## ✨ Key Features

### 📊 Dashboard Analytics
- Real-time API usage statistics
- Token consumption charts and graphs
- Request tracking and trends
- Recent activity logs and audit trail

### 🔑 API Key Management
- Generate secure API keys with customizable permissions
- Set per-key token limits and rate limits
- Track requests and detailed usage per key
- Enable/disable keys on the fly
- Reset statistics and usage data

### 📈 Usage Logs & Monitoring
- Comprehensive paginated log table
- Advanced filtering (by date, model, API key)
- Full-text search capabilities
- Token usage breakdown per request
- Export data functionality

### 🤖 AI Model Management
- List all installed Ollama models
- Set default model for API calls
- Test models with custom prompts
- Monitor model health and availability
- Model performance metrics

### ⚙️ Advanced Settings
- Configure global rate limits
- Set token consumption caps
- Auto-disable abused/limit-exceeded keys
- Default model selection
- Theme customization

### 🔐 Security & Authentication
- Secure session-based authentication
- Demo credentials for testing
- Protected routes and endpoints
- API key encryption
- Request validation and sanitization

## � Screenshots

### Chat Interface & Document Generation
![Chat Interface - Document Generation](/screenshots/Screenshot%202026-04-30%20092631.png)
*Generate documents with AI-powered content creation using local Ollama models*

### Model Management
![Models Page - View Installed AI Engines](/screenshots/Screenshot%202026-04-30%20092732.png)
*Manage and monitor all your locally installed AI models with detailed metrics*

### API Keys Management
![API Keys - Credentials & Usage Monitoring](/screenshots/Screenshot%202026-04-30%20092743.png)
*Create, manage, and monitor API keys with real-time usage statistics*

## �🛠️ Tech Stack

| Category | Technologies |
|----------|---------------|
| **Frontend** | Next.js 15+, React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui Components |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | Prisma ORM, SQLite |
| **UI Components** | shadcn/ui, Radix UI |
| **Charts** | Recharts |
| **Data Tables** | TanStack React Table |
| **Icons** | Lucide Icons |
| **Utilities** | bcrypt, clsx, class-variance-authority |

## 📦 Project Structure

```
genapi/
├── app/
│   ├── api/                 # API routes
│   │   ├── api-keys/       # API key management endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   ├── ollama/         # Ollama integration
│   │   ├── settings/       # Settings endpoints
│   │   ├── usage-logs/     # Usage tracking
│   │   └── usage-stats/    # Analytics endpoints
│   ├── chat/               # Chat interface page
│   ├── dashboard/          # Main dashboard
│   │   ├── api-keys/      # API keys management UI
│   │   ├── generate/      # API generation tool
│   │   ├── models/        # Model management
│   │   ├── settings/      # Settings UI
│   │   └── usage/         # Usage analytics
│   ├── login/              # Authentication page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # shadcn UI components
│   ├── chat/               # Chat components
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── auth.ts            # Authentication utilities
│   ├── db.ts              # Database client
│   ├── ollama.ts          # Ollama API integration
│   └── utils.ts           # Helper utilities
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Database seeding
│   └── migrations/        # Database migrations
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
└── package.json           # Dependencies

```

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Ollama** - [Download from ollama.ai](https://ollama.ai)
- **Ollama models** pulled (e.g., `ollama pull llama2`)

### Installation Steps

```bash
# 1. Navigate to the project directory
cd genapi

# 2. Install dependencies
npm install

# 3. Setup the database
npx prisma migrate dev --name init

# 4. Seed default data
npx prisma db seed
```

### Configuration

Create a `.env` file in the root directory with:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
AUTH_SECRET="your-secure-secret-key-change-in-production"

# Ollama API
OLLAMA_API_URL="http://localhost:11434"
```

### Running the Application

#### Terminal 1 - Start Ollama:
```bash
ollama serve
```
Expected output: `Listening on 127.0.0.1:11434`

#### Terminal 2 - Start Development Server:
```bash
npm run dev
```
Expected output: `Ready in XXXms`

#### Access the Application:
Open your browser and navigate to: **http://localhost:3000**

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `demo123`

## 📚 Available Scripts

```bash
# Development
npm run dev           # Start development server with Turbopack
npm run build         # Build for production
npm start             # Start production server

# Code Quality
npm run lint          # Run ESLint
npm run format        # Format with Prettier
npm run typecheck     # Check TypeScript types

# Database
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed database
npx prisma studio        # Open Prisma Studio
```

## 📖 Additional Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Quick Start Guide](./QUICKSTART.md) - Get started in 5 minutes
- [Design System](./DESIGN_SYSTEM.md) - UI component documentation
- [Build Summary](./BUILD_SUMMARY.md) - Project architecture details

## 🔧 Adding UI Components

The project uses **shadcn/ui** components. To add a new component:

```bash
npx shadcn@latest add [component-name]
```

This will place the component in `components/ui/` directory.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Ollama](https://ollama.ai/) - Local AI models
- [Next.js](https://nextjs.org/) - React framework

---

**Built with ❤️ by Shubham Kambli**
