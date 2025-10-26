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
