# 🧭 TaskPilot – Daily Progress Log

A running summary of daily progress, design decisions, and learning notes  
for the **TaskPilot – Full-Stack SaaS Build** project.

---

## 🗓️ Day 1 – Workspace Setup (Mon, Oct 20, 2025)

**Goal:** Establish a scalable monorepo foundation using `pnpm`.

**What we did:**
- Initialized root project: `taskpilot/`
- Configured `pnpm-workspace.yaml` for multi-package setup
- Created workspaces: `api`, `ui`, `consumer`, `infra`, `tests`
- Linked workspaces via `"workspaces"` in root `package.json`
- Verified workspace scope with `pnpm list -r`
- Learned difference between dependencies & devDependencies

**Outcome:**  
✅ Functional pnpm monorepo ready for distributed services

---

## 🗓️ Day 2 – API Layer Setup (Tue, Oct 21, 2025)

**Goal:** Build the Express API service skeleton with security, health checks, and Auth0 readiness.

**What we did:**
- Installed runtime deps (`express`, `helmet`, `cors`, `morgan`, `dotenv`, `express-oauth2-jwt-bearer`)
- Installed dev dep (`nodemon`)
- Created folder structure under `api/src`
- Built main entrypoint `index.js` and `/health` route
- Verified API runs locally with `pnpm dev:api`
- Added `.env.sample` and placeholder Auth0 middleware
- Documented P → D → R (Prevent, Discover, Recover) coverage
**P → D → R Summary – API Layer**

| Stage | Description | Implementation |
|:------:|--------------|----------------|
| 🛡️ **Prevent** | Avoid common issues & vulnerabilities | - `helmet` adds secure headers<br>- `cors` restricts origins<br>- `.env` isolates secrets |
| 🔎 **Discover** | Detect issues early | - `morgan` logs each request<br>- `/health` endpoint exposes uptime<br>- clear startup logs |
| 🔁 **Recover** | Stay resilient during failure | - Graceful restarts with `nodemon`<br>- `/health` endpoint supports readiness probes<br>- Fallback `PORT` prevents crashes |


**Outcome:**  
✅ Working Express API with basic security and health endpoints  
✅ Ready for Auth0 integration on Day 3

---

## 🗓️ Next Steps (Day 3 Preview)

**Goal:** Integrate Auth0 authentication and test a protected route.

**Planned tasks:**
- Create Auth0 application (dashboard setup)
- Configure `.env` with domain, client ID, audience
- Implement `/api/private` using `requireAuth`
- Verify JWT validation with Postman / curl
- Extend dailyUpdate log accordingly

---

## 🗓️ Day 3 – Auth0 Integration & Secure Routes (Wed, Oct 22, 2025)

**Goal:** Integrate Auth0 authentication into the API and secure endpoints using JWT validation.

**What we did:**
- Configured Auth0 tenant under domain `https://dev-clsc7m01sz2t2uta.us.auth0.com/`
- Created new API in Auth0 → **TaskPilot API** with audience `https://taskpilot-api`
- Added `.env` file with Auth0 domain & audience values
- Implemented `/api/private` route secured by `requireAuth` middleware
- Added global error handler to return JSON (401 on missing/invalid token)
- Tested with a real Auth0 JWT (✅ authorized, ❌ unauthorized verified)
- Verified decoded JWT structure (`header`, `payload`, `token`) returned by API

**P → D → R Summary – Auth Layer**

| Stage | Description | Implementation |
|:------:|--------------|----------------|
| 🛡️ **Prevent** | Enforce strong token validation | - Auth0 `RS256` public key verification<br>- `requireAuth` middleware rejects invalid/missing tokens<br>- Secrets externalized in `.env` |
| 🔎 **Discover** | Detect unauthorized or expired tokens | - Global error handler logs token errors<br>- 401 JSON responses make monitoring easy |
| 🔁 **Recover** | Maintain graceful failure on auth errors | - Never crash on invalid tokens<br>- Default error middleware prevents HTML stack traces |

**Outcome:**  
✅ Auth0-integrated API with secure `/api/private` route  
✅ Verified end-to-end token authentication using real JWT  
✅ Foundation ready for multi-tenant + role-based access in Day 4

---

### 🗓 **Day 4 — Role-Based Access & Mock Integration**

#### 🧭 **Objective**
Implement secure, role-based authorization on top of Auth0 authentication, even with the free-tier Flow limitation.

#### 🧩 **What We Built**
- Added two Auth0 roles: **`admin`** and **`user`**
- Linked API permissions (`read:data`, `write:data`)
- Wrote local middlewares:  
  - **`injectMockRoles`** → temporarily adds roles to `req.auth.payload`  
  - **`checkRole(role)`** → enforces role-based access  
- Created protected routes `/api/user` and `/api/admin` with conditional access  
- Verified JWT validation + authorization pipeline end-to-end

#### 🔄 **Execution Flow**
curl → requireAuth → injectMockRoles → checkRole(role) → route handler → res.json()


#### 🧠 **Key Learnings**
- Express middleware chain = sequence of checkpoints  
- `next()` passes control; `res.json()` ends the chain  
- Optional chaining (`?.`) prevents crashes on undefined properties  
- Role enforcement cleanly decouples authentication from authorization  

---

### 🔐 **P → D → R (Prevent | Detect | Recover)**

| Phase | Example in Today’s Work | Purpose |
|:------|:--------------------------|:---------|
| **Prevent** | `checkRole()` middleware blocks unauthorized access before business logic | Stops privilege escalation early |
| **Detect** | 403 JSON response includes `requiredRole` and `rolesPresent` | Detects mis-configured roles |
| **Recover** | Mock roles allow local development without Auth0 Flows | Ensures continuity until full RBAC enabled |

---

✅ **Status:** Day 4 Complete  
Next → **Day 5: Multi-Tenant Claims & Tenant-Scoped Data in MongoDB**

---

---

### 🗓 **Day 5 — Multi-Tenant Claims & Tenant-Scoped Data**

#### 🧭 **Objective**
Introduce tenant awareness into the TaskPilot API so each authenticated request carries both identity and organizational context.

#### 🧩 **What We Built**
- Added new middleware **`injectMockTenant`** to enrich JWT payloads with:
"https://taskpilot-api/tenant": "tenant-A"

- Extended routes (`/api/user`, `/api/admin`) to include tenant info in responses
- Created a new diagnostic endpoint `/api/tenant-info` showing:
- `tenant`
- `roles`
- `sub`
- `aud` / `iss`
- Designed MongoDB tenant-aware schema pattern:
```json
{
  "_id": "...",
  "tenant": "tenant-A",
  "ownerId": "auth0|user123",
  "data": { ... }
}
```

---

### 🗓 **Day 6 — MongoDB Integration + Tenant-Scoped CRUD**

#### 🧭 **Objective**
Connect the TaskPilot API to a live MongoDB Atlas database and implement the first
tenant-aware **CRUD** endpoints for persistent data.

---

#### 🧩 **What We Built**
- Created a **free MongoDB Atlas cluster** and database user  
- Added `.env` entry  
  ```bash
  MONGO_URI=mongodb+srv://hellogaur_db_user:<password>@taskpilot-cluster.zhl2ln0.mongodb.net/taskpilot
- Installed and configured Mongoose
   ```bash
   pnpm --filter api add mongoose
- Added connectDB() helper → verified live connection

- Built Project model with tenant and owner metadata
  ```json
  {
  "name": "Tenant Portal",
  "description": "First live Mongo project",
  "tenantId": "tenant-A",
  "createdBy": "<auth0 sub>"
  }

- Created /api/projects router with:

- POST /api/projects → Create new project

- GET /api/projects → Fetch all projects for current tenant

- Verified live round-trip:

- JWT → Express middleware → Mongoose → Atlas collection

- Viewed data directly in MongoDB Atlas UI 