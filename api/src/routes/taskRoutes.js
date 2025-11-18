import express from 'express';
import Task from '../models/taskModel.js';
import { injectMockRoles } from '../middleware/mockRoles.js';
import { injectMockTenant } from '../middleware/injectMockTenant.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/tasks — Create new task
/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     description: Adds a new task for the family. Anyone in the family can create tasks and assign them to others.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pick up groceries"
 *               description:
 *                 type: string
 *                 example: "Get milk, eggs, and bread"
 *               assignedToEmail:
 *                 type: string
 *                 example: "dad@family.com"
 *               assignedToName:
 *                 type: string
 *                 example: "Dad"
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth, injectMockRoles, injectMockTenant, async (req, res) => {
  try {
    const { name, description, assignedToEmail, assignedToName, status, dueDate } = req.body;
    const tenant = req.auth.payload['https://taskpilot-api/tenant'];
    const ownerSub = req.auth.payload.sub;
    const createdByEmail = req.auth.payload.email || req.auth.payload['https://taskpilot-api/email'];
    const createdByName = req.auth.payload.name || req.auth.payload['https://taskpilot-api/name'] || createdByEmail;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ ok: false, error: 'Task name is required' });
    }
    if (!tenant) {
      return res.status(400).json({ ok: false, error: 'Family context is required' });
    }
    if (!createdByEmail) {
      return res.status(400).json({ ok: false, error: 'User email is required' });
    }

    const task = await Task.create({
      ownerSub,
      name: name.trim(),
      description: description?.trim() || '',
      tenantId: tenant,
      assignedToEmail: assignedToEmail?.trim() || null,
      assignedToName: assignedToName?.trim() || null,
      createdByEmail: createdByEmail.trim(),
      createdByName: createdByName.trim(),
      status: status || 'todo',
      dueDate: dueDate || null,
      activityLog: [
        {
          action: 'created',
          performedBy: createdByEmail.trim(),
          performedByName: createdByName.trim(),
          timestamp: new Date(),
          changes: {
            status: status || 'todo',
            assignedTo: assignedToEmail ? `${assignedToName} (${assignedToEmail})` : 'Unassigned',
          },
        },
      ],
    });

    res.status(201).json({ ok: true, task });
  } catch (err) {
    console.error('❌ Error creating task:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// GET /api/tasks — Fetch all tasks for this family
/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Get all tasks for the family
 *     description: Returns ALL tasks for the family (shared calendar view). Anyone in the family can see all tasks.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
 *     responses:
 *       200:
 *         description: Successful response with a list of tasks
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.get('/', requireAuth, injectMockRoles, injectMockTenant, async (req, res) => {
  try {
    const tenant = req.auth.payload['https://taskpilot-api/tenant'];
    
    if (!tenant) {
      return res.status(400).json({ ok: false, error: 'Family context is required' });
    }

    // Family-wide view: return ALL tasks for this family
    const tasks = await Task.find({ tenantId: tenant }).sort({ createdAt: -1 });

    res.json({ ok: true, tasks, count: tasks.length });
  } catch (err) {
    console.error('❌ Error fetching tasks:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/tasks/:id — Get details of a specific task
/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get details for a specific task
 *     description: Returns full task data for the given ID (family-scoped).
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 671e9f1b234abc56def01234
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found or not accessible
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', requireAuth, injectMockRoles, injectMockTenant, async (req, res) => {
  try {
    const tenant = req.auth.payload['https://taskpilot-api/tenant'];
    const { id } = req.params;

    if (!tenant) {
      return res.status(400).json({ ok: false, error: 'Family context is required' });
    }

    // Family-scoped lookup
    const task = await Task.findOne({ _id: id, tenantId: tenant });

    if (!task) {
      return res.status(404).json({ ok: false, error: 'Task not found or access denied' });
    }

    res.json({ ok: true, task });
  } catch (err) {
    console.error('❌ Error fetching task by ID:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// PUT /api/tasks/:id — Update a task
/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Edit any task in the family. Any family member can update any task (shared calendar model).
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
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
 *                 example: "Updated task name"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               assignedToEmail:
 *                 type: string
 *               assignedToName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.put('/:id', requireAuth, injectMockRoles, injectMockTenant, async (req, res) => {
  try {
    const tenant = req.auth.payload['https://taskpilot-api/tenant'];
    const { id } = req.params;
    const { name, description, status, dueDate, assignedToEmail, assignedToName } = req.body;
    const userEmail = req.auth.payload.email || req.auth.payload['https://taskpilot-api/email'];
    const userName = req.auth.payload.name || req.auth.payload['https://taskpilot-api/name'] || userEmail;

    if (!tenant) {
      return res.status(400).json({ ok: false, error: 'Family context is required' });
    }

    // First, get the existing task to track changes
    const existingTask = await Task.findOne({ _id: id, tenantId: tenant });
    if (!existingTask) {
      return res.status(404).json({ ok: false, error: 'Task not found or access denied' });
    }

    // Build update object with only provided fields
    const updates = {};
    const changes = {};
    let action = 'updated';

    if (name !== undefined) {updates.name = name?.trim();}
    if (description !== undefined) {updates.description = description?.trim();}
    
    // Track status changes
    if (status !== undefined && status !== existingTask.status) {
      updates.status = status;
      changes.status = { from: existingTask.status, to: status };
      action = status === 'done' ? 'completed' : 'status_changed';
    }
    
    if (dueDate !== undefined) {updates.dueDate = dueDate;}
    
    // Track assignment changes
    if (assignedToEmail !== undefined) {
      const oldAssignee = existingTask.assignedToEmail;
      const newAssignee = assignedToEmail?.trim() || null;
      
      if (oldAssignee !== newAssignee) {
        updates.assignedToEmail = newAssignee;
        updates.assignedToName = assignedToName?.trim() || null;
        
        if (!oldAssignee && newAssignee) {
          action = 'assigned';
          changes.assignedTo = { to: `${assignedToName} (${newAssignee})` };
        } else if (oldAssignee && !newAssignee) {
          action = 'unassigned';
          changes.assignedTo = { from: `${existingTask.assignedToName} (${oldAssignee})` };
        } else if (oldAssignee && newAssignee) {
          action = 'reassigned';
          changes.assignedTo = {
            from: `${existingTask.assignedToName} (${oldAssignee})`,
            to: `${assignedToName} (${newAssignee})`,
          };
        }
      }
    }

    // Add activity log entry
    const activityEntry = {
      action,
      performedBy: userEmail,
      performedByName: userName,
      timestamp: new Date(),
      changes,
    };

    updates.$push = { activityLog: activityEntry };

    // Family calendar: any family member can edit any task (only tenant check, no owner check)
    const task = await Task.findOneAndUpdate(
      { _id: id, tenantId: tenant },
      updates,
      { new: true, runValidators: true },
    );

    if (!task) {
      return res.status(404).json({ ok: false, error: 'Task not found or access denied' });
    }

    res.json({ ok: true, task });
  } catch (err) {
    console.error('❌ Error updating task:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/tasks/:id — Remove a task
/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a specific task
 *     description: Removes a task by its MongoDB ID. Any family member can delete any task (shared calendar model).
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', requireAuth, injectMockRoles, injectMockTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = req.auth?.payload?.['https://taskpilot-api/tenant'];

    if (!tenant) {
      return res.status(400).json({ ok: false, error: 'Family context is required' });
    }

    // Family calendar: any family member can delete any task (only tenant check, no owner check)
    const task = await Task.findOneAndDelete({
      _id: id,
      tenantId: tenant,
    });

    if (!task) {
      console.warn('🚫 Delete failed — task not found:', {
        taskId: id,
        tenantFromToken: tenant,
      });
    
      return res.status(404).json({
        ok: false,
        error: 'Task not found or access denied',
      });
    }
    

    res.json({ ok: true, message: 'Task deleted successfully', id });
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


export default router;
