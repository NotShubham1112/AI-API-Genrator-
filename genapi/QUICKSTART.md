# 🚀 LocalAI API Platform - Quick Start Guide

## 1️⃣ Prerequisites

Ensure you have:
- **Node.js 18+** installed
- **Ollama** running locally (download from [ollama.ai](https://ollama.ai))
- **Ollama models** pulled (e.g., `ollama pull llama2`)

## 2️⃣ Installation & Setup

```bash
# Navigate to project directory
cd genapi

# Install dependencies (already done)
npm install

# Create database and tables
npx prisma migrate dev --name init

# Seed default user (already done)
npx prisma db seed
```

## 3️⃣ Configure Environment

Make sure `.env` file exists with:

```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="your-secret-key-change-in-production"
OLLAMA_API_URL="http://localhost:11434"
```

## 4️⃣ Start Services

**Terminal 1 - Start Ollama:**
```bash
ollama serve
```

You should see: `Listening on 127.0.0.1:11434`

**Terminal 2 - Start Development Server:**
```bash
npm run dev
```

You should see: `Ready in XXXms`

## 5️⃣ Access the Dashboard

Open your browser: **http://localhost:3000**

### Login Credentials
```
Username: notshubham
Password: 1112
```

## 🎯 First Steps

### Step 1: Check Ollama Status
- Dashboard shows "Ollama Online" if connection is working
- If offline, check Ollama is running on http://localhost:11434

### Step 2: Create an API Key
1. Go to **API Keys** page
2. Click **Create New Key**
3. Name it (e.g., "My First Key")
4. Click **Create API Key**
5. Copy the key immediately (you won't see it again!)

### Step 3: Test the API

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Authorization: Bearer sk_local_xxxx" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!"}'
```

**Expected Response:**
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

### Step 4: Monitor Usage
- Go to **Dashboard** to see request/token stats
- Check **Usage Logs** for detailed request history
- Monitor **Models** for available models and health

## 🛠️ Common Tasks

### Pull a New Model
```bash
ollama pull mistral
```
Then refresh the **Models** page in the dashboard.

### Check Database
```bash
npx prisma studio
```

### Reset Everything
```bash
# Delete database
rm prisma/dev.db

# Recreate and seed
npx prisma migrate dev --name init
npx prisma db seed
```

### View Logs
```bash
# Check if any errors in browser console (F12)
# Check API responses in Network tab
```

## 📋 API Endpoints

### Chat
- **POST** `/api/v1/chat` - Generate response with model
  - Required: `Authorization: Bearer sk_local_xxx`
  - Body: `{ "prompt": "...", "model": "..." }`

### Management (Dashboard Only)
- **GET** `/api/api-keys` - List all keys
- **POST** `/api/api-keys` - Create new key
- **PATCH** `/api/api-keys/[id]` - Update key
- **DELETE** `/api/api-keys/[id]` - Delete key
- **GET** `/api/usage-logs` - Get usage logs
- **GET** `/api/settings` - Get settings
- **PATCH** `/api/settings` - Update settings

## ⚠️ Troubleshooting

### Port Already in Use
```bash
# Next.js default is 3000, you can change it:
npm run dev -- -p 3001
```

### Ollama Connection Failed
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Should return: {"models": [...]}
```

### Database Issues
```bash
# Reset database completely
npx prisma migrate reset
```

### API Key Not Working
1. Verify key is **Active** (check API Keys page)
2. Verify Bearer token format: `sk_local_xxxxx`
3. Check Authorization header: `Authorization: Bearer sk_local_xxxxx`
4. Check if rate limit exceeded (60 req/min default)

### Models Not Showing
1. Ensure model is installed: `ollama list`
2. Pull a model: `ollama pull llama2`
3. Refresh Models page in dashboard

## 📊 Dashboard Pages

### Dashboard (Overview)
- Total API keys
- Active keys
- Total requests & tokens
- Daily charts
- Recent activity

### API Keys
- Create, rename, disable keys
- View partial key (masked)
- Reset statistics
- Check requests & usage

### Usage Logs
- Search by key/model
- Filter by date range
- View token breakdown
- Paginated results

### Models
- List installed models
- Set default model
- Test models
- Check model size & modified date

### Settings
- Configure default model
- Rate limit settings
- Global token caps
- Auto-disable abused keys

## 🔗 External URLs

- **Ollama API**: http://localhost:11434
- **Dashboard**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (when running `npx prisma studio`)

## 📝 Next Steps

1. ✅ Get dashboard running
2. ✅ Create first API key
3. ✅ Test chat endpoint
4. ✅ Monitor usage
5. 🎯 Integrate with applications using API key
6. 🎯 Configure rate limits & token caps
7. 🎯 Deploy to production (with proper security)

## 🆘 Need Help?

1. Check SETUP.md for detailed documentation
2. Review browser console for errors (F12)
3. Check terminal output for backend errors
4. Verify Ollama is running and accessible
5. Check database with `npx prisma studio`

---

**You're all set! Happy coding! 🎉**
