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

## ⚙️ Free-Tier Setup Guide (Coming Soon)

This section will walk you through running **TaskPilot** on free tiers:
- Auth0 Developer Plan (no paid tenant required)
- MongoDB Atlas Free Cluster
- Local Node.js + pnpm setup

It will include:
1. Complete clone-and-run instructions  
2. Ready-to-use `.env.sample` for local testing  
3. Mock-tenant + mock-role options for Auth0 free tier  

➡️ Expected Release: After Day-8 (when the React UI connects end-to-end)

