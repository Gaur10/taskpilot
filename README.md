# 🚀 TaskPilot – Full-Stack SaaS Build

**TaskPilot** is a hands-on project to learn distributed, tenant-aware SaaS design from scratch.  
It combines **Auth0**, **Express**, **MongoDB Atlas**, and **React (UI)** to simulate a real-world multi-tenant application.

---

### 🧱 Current Architecture
```mermaid
graph TD
  A["Browser / Client UI (React + Auth0 SDK)"] --> B["Express API (Node.js)"]
  B --> C["Auth0 (Identity Provider)"]
  B --> D["MongoDB Atlas (Tenant-Scoped Data)"]
  B --> E["Kafka (Future Async Layer)"]
  B --> F["OpenTelemetry / Grafana (Future Observability)"]

---

## ⚙️ Quick Start Setup

### Prerequisites
- Node.js v18+ 
- pnpm v10+
- MongoDB Atlas account (free tier)
- Auth0 account (free tier)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/Gaur10/taskpilot.git
   cd taskpilot
   pnpm install
   ```

2. **Configure API environment**
   ```bash
   cd api
   cp .env.example .env
   # Edit .env with your MongoDB URI and Auth0 credentials
   ```

3. **Required environment variables** (see `api/.env.example`):
   - `MONGO_URI` - MongoDB Atlas connection string
   - `AUTH0_ISSUER` or `AUTH0_DOMAIN` - Your Auth0 tenant URL
   - `AUTH0_AUDIENCE` - API identifier from Auth0 dashboard
   - `NODE_ENV` - Set to `development` for local, `production` for deployed
   - `ALLOW_MOCK_AUTH` - Set to `true` for dev-only mock roles/tenants

4. **Run the API server**
   ```bash
   # From project root
   pnpm dev:api
   
   # Server starts at http://localhost:4000
   # Health check: http://localhost:4000/api/health
   # Swagger docs: http://localhost:4000/api-docs
   ```

5. **Run the UI** (optional)
   ```bash
   pnpm dev:ui
   # UI starts at http://localhost:5173
   ```

### Auth0 Setup
1. Create a free Auth0 account at https://auth0.com
2. Create a new API in Auth0 dashboard
3. Note the Domain and API Identifier (audience)
4. For development: enable mock auth by setting `ALLOW_MOCK_AUTH=true` in `.env`
5. For production: configure Auth0 Rules/Actions to inject custom claims: `https://taskpilot-api/roles` and `https://taskpilot-api/tenant`

### MongoDB Atlas Setup
1. Create free cluster at https://cloud.mongodb.com
2. Create database user with read/write permissions
3. Whitelist your IP or allow from anywhere (0.0.0.0/0) for development
4. Copy connection string to `MONGO_URI` in `.env`

