import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateTaskDescription } from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/ai/suggest-description
 * 
 * Generate AI-powered task description based on task name
 * 
 * @body {string} taskName - The name of the task
 * @body {string} assignedToName - (Optional) Who it's assigned to
 * @body {string} dueDate - (Optional) Due date
 * @body {array} tags - (Optional) Task tags
 */
router.post('/suggest-description', requireAuth, async (req, res) => {
  try {
    const { taskName, assignedToName, dueDate, tags } = req.body;

    // Validate input
    if (!taskName || taskName.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Task name is required',
      });
    }

    // Generate description
    const description = await generateTaskDescription(taskName, {
      assignedToName,
      dueDate,
      tags,
    });

    // If AI generation failed or no API key, return helpful message
    if (!description) {
      return res.json({
        ok: true,
        description: null,
        message: 'AI service unavailable',
      });
    }

    res.json({
      ok: true,
      description,
      generated: true,
    });
  } catch (error) {
    console.error('❌ Error in AI suggestion endpoint:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to generate description',
    });
  }
});

export default router;
