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
 *     tags:
 *       - Projects
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
 *               description:
 *                 type: string
 *                 example: "Optional description here"
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
    const ownerSub = req.auth.payload.sub; // ✅ Auth0 user ID

    const project = await Project.create({
      ownerSub, // ✅ required field
      name,
      description,
      tenantId: tenant,
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
 *     tags:
 *       - Projects
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

// GET /api/projects/:id — Get details of a specific project
/**
 * @openapi
 * /projects/{id}:
 *   get:
 *     summary: Get details for a specific project
 *     description: Returns full project data for the given ID (tenant-scoped).
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 671e9f1b234abc56def01234
 *     responses:
 *       200:
 *         description: Project found
 *       404:
 *         description: Project not found or not accessible
 *       401:
 *         description: Unauthorized
 */
 router.get("/:id", requireAuth, injectMockRoles, injectMockTenant, async (req, res) => {
  try {
    const tenant = req.auth.payload["https://taskpilot-api/tenant"];
    const { id } = req.params;

    // Tenant-scoped lookup
    const project = await Project.findOne({ _id: id, tenantId: tenant });

    if (!project) {
      return res.status(404).json({ ok: false, message: "Project not found" });
    }

    res.json({ ok: true, project });
  } catch (err) {
    console.error("❌ Error fetching project by ID:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// PUT /api/projects/:id — Update a project
/**
 * @openapi
 * /projects/{id}:
 *   put:
 *     summary: Update a project
 *     description: Edit name or description for an existing project
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated project name"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
 router.put("/:id", requireAuth, injectMockRoles, injectMockTenant, async (req, res) => {
  try {
    const tenant = req.auth.payload["https://taskpilot-api/tenant"];
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: id, tenantId: tenant },
      { name, description },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ ok: false, message: "Project not found" });
    }

    res.json({ ok: true, project });
  } catch (err) {
    console.error("❌ Error updating project:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/projects/:id — Remove a project
/**
 * @openapi
 * /projects/{id}:
 *   delete:
 *     summary: Delete a specific project
 *     description: Removes a project by its MongoDB ID (tenant and Auth0 protected).
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID to delete
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
 router.delete("/:id", requireAuth, injectMockRoles, injectMockTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerSub = req.auth?.payload?.sub;
    const tenant = req.auth?.payload?.["https://taskpilot-api/tenant"];
    

    // Fallback: allow delete if fields missing for older data
    const query = { _id: id };
    if (ownerSub) query.$or = [{ ownerSub }, { createdBy: ownerSub }];
    if (tenant) query.tenantId = tenant;
    const project = await Project.findOneAndDelete(query);

    if (!project) {
      // Debug log for developers
      console.warn("🚫 Delete blocked — reason:", {
        projectId: id,
        userSub: ownerSub,
        tenantFromToken: tenant,
        reason: "No matching project found for this _id, tenant, and ownerSub/createdBy combo"
      });
    
      return res.status(404).json({
        ok: false,
        error:
          "Delete blocked: You can only delete projects created under your Auth0 account within the same tenant.",
        hint:
          "If this project was created via Swagger/cURL (M2M client), it uses a different Auth0 identity (sub) than your UI login.",
      });
    }
    

    res.json({ ok: true, message: "Project deleted successfully", id });
  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


export default router;
