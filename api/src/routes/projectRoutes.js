import express from "express";
import Project from "../models/projectModel.js";
import { injectMockRoles } from "../middleware/mockRoles.js";
import { injectMockTenant } from "../middleware/injectMockTenant.js";
import pkg from "express-oauth2-jwt-bearer";
const { auth } = pkg;

// define middleware directly
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
});

const router = express.Router();

// POST /api/projects — Create new project
/**
 * @openapi
 * /projects:
 *   post:
 *     summary: Create a new project
 *     description: Adds a new project for the logged-in user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My New Project"
 *     responses:
 *       201:
 *         description: Project created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", requireAuth, injectMockRoles, injectMockTenant, async (req, res) => {
  try {
    const { name, description } = req.body;
    const tenant = req.auth.payload["https://taskpilot-api/tenant"];
    const createdBy = req.auth.payload.sub;

    const project = await Project.create({
      name,
      description,
      tenantId: tenant,
      createdBy,
    });

    res.status(201).json({ ok: true, project });
  } catch (err) {
    console.error("❌ Error creating project:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/projects — Fetch all projects for this tenant
/**
 * @openapi
 * /projects:
 *   get:
 *     summary: Get all projects for the authenticated user
 *     description: Returns a list of projects belonging to the current Auth0 user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with a list of projects
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.get("/", requireAuth, injectMockRoles, injectMockTenant, async (req, res) => {
  try {
    const tenant = req.auth.payload["https://taskpilot-api/tenant"];
    const projects = await Project.find({ tenantId: tenant });

    res.json({ ok: true, projects });
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
