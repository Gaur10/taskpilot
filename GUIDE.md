# 🧭 TaskPilot – 30-Day Full-Stack SaaS Learning Guide

A **day-by-day self-learning roadmap** for building a realistic, secure, multi-tenant SaaS platform using free-tier services like **Auth0**, **MongoDB Atlas**, **Node.js**, **React**, and **Grafana/SigNoz**.

> ⚡️ Everything runs on free tiers — ideal for hands-on learning, portfolio building, or interview preparation.

---

## 🪜 Phase 1 – Foundation (Days 1–7)

| Day | Topic | Core Concepts |
|:---:|:------|:---------------|
| **Day 1** | 🧩 Project Setup | Monorepo using `pnpm`, workspace layout (`api`, `ui`, `infra`, `tests`) |
| **Day 2** | ⚙️ Express Basics | Server bootstrapping, routes, health checks, middlewares |
| **Day 3** | 🔐 Auth0 Integration | JWT validation, `/api/private` secured route |
| **Day 4** | 👥 Roles & Tenants | Role-based access control (RBAC) and mock tenants for free-tier Auth0 |
| **Day 5** | 🧾 Tenant Claims | Inject `tenantId` + `sub` (user ID) into request context |
| **Day 6** | 🗄️ MongoDB CRUD | Connect MongoDB Atlas, create tenant-aware Project model |
| **Day 7** | 🔍 Observability | Structured logs (Winston), request logs (Morgan), traces (OpenTelemetry + Grafana/SigNoz) |

---

## 🧱 Phase 2 – Expansion (Days 8–14)

| Day | Topic | Focus |
|:---:|:------|:------|
| **Day 8** | 🎨 Frontend Setup | React + Vite + Auth0 SDK |
| **Day 9** | 🔗 Connect UI → API | Secure API calls with JWTs |
| **Day 10** | 🧩 UI CRUD | Create & list projects from frontend |
| **Day 11** | 🕵️ Audit Logs | “Who did what” trail per tenant |
| **Day 12** | ⚡ Async Events | Kafka / Redpanda producers + consumers |
| **Day 13** | 🌐 Cloudflare Edge | CDN, WAF, and caching layer |
| **Day 14** | 🚀 Deployment | Deploy to Render / Vercel (free tiers) |

---

## ☁️ Phase 3 – Deepening the SaaS Model (Days 15–30)

| Focus Area | Highlights |
|-------------|-------------|
| **Security & Compliance** | SOC2-style audit trails, JWT expiry/refresh |
| **Async Processing** | Kafka → Mongo pipelines, retry logic |
| **Observability Expansion** | Grafana dashboards + SigNoz metrics |
| **UI/UX Polish** | React + Tailwind multi-tenant dashboard |
| **CI/CD & Testing** | GitHub Actions + Playwright test automation |
| **Scalability Concepts** | Load balancing, caching, cost optimization |
| **Final Demo** | Complete SaaS MVP walkthrough |

---

## 📚 Learning Objectives

- Understand **modern SaaS architecture**: Edge → API → DB → Async → Observability  
- Learn how **Auth0, MongoDB, and Node.js** integrate for secure multi-tenant access  
- Practice **Prevent → Detect → Recover (P → D → R)** design thinking  
- Gain hands-on familiarity with **logging, metrics, tracing, and error recovery**  
- Build a **portfolio-ready full-stack application** from scratch

---

## ⚙️ Free-Tier Setup (Coming Soon)

A detailed “clone & run” section will be added once the UI and observability layers are complete (after Day 8).  
It will include:
- Auth0 developer setup  
- MongoDB Atlas cluster creation  
- Environment variables template (`.env.sample`)  
- Local run instructions with `pnpm`

---

## 📁 Project Structure

```bash
taskpilot/
│
├── api/         # Express API + Auth0 + MongoDB
├── ui/          # React + Auth0 SDK frontend
├── consumer/    # Kafka consumer service (Node Worker)
├── infra/       # IaC / deployment scripts (Cloudflare + Render)
├── tests/       # Playwright API/UI tests
│
├── dailyUpdate.md
├── GUIDE.md
└── README.md


---

> 🏁 **By Day-30**, you’ll have a production-style multi-tenant SaaS app — secured, observable, deployable, and portfolio-ready — all learned from the ground up.
