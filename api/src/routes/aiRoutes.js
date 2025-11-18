import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateTaskDescription } from '../services/aiService.js';
import FamilySettings from '../models/familySettingsModel.js';

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
    const tenantId = req.auth.tenant;

    // Validate input
    if (!taskName || taskName.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Task name is required',
      });
    }

    // Fetch family settings for personalized context
    let familyContext = null;
    try {
      const settings = await FamilySettings.findOne({ tenantId });
      if (settings) {
        familyContext = settings.getAIContext();
        console.log('📋 Using family context for AI generation');
      }
    } catch (settingsError) {
      console.warn('⚠️  Could not fetch family settings:', settingsError.message);
      // Continue without family context
    }

    // Generate description with family context
    const description = await generateTaskDescription(taskName, {
      assignedToName,
      dueDate,
      tags,
      familyContext,
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
