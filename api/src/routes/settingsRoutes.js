import express from 'express';
import FamilySettings from '../models/familySettingsModel.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/settings
 * Get family settings for the authenticated tenant
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.auth.payload['https://taskpilot-api/tenant'];

    let settings = await FamilySettings.findOne({ tenantId });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await FamilySettings.create({
        tenantId,
        preferences: {
          groceryStores: [],
          schools: [],
          neighborhood: '',
          routines: {
            groceryShopping: '',
            schoolPickup: '',
            other: '',
          },
        },
      });
    }

    res.json({
      ok: true,
      settings: {
        tenantId: settings.tenantId,
        preferences: settings.preferences,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching family settings:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch family settings',
      error: error.message,
    });
  }
});

/**
 * PUT /api/settings
 * Update family settings for the authenticated tenant
 */
router.put('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.auth.payload['https://taskpilot-api/tenant'];
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({
        ok: false,
        message: 'Preferences are required',
      });
    }

    // Validate preferences structure
    const validationErrors = [];

    if (preferences.groceryStores && !Array.isArray(preferences.groceryStores)) {
      validationErrors.push('groceryStores must be an array');
    }

    if (preferences.schools && !Array.isArray(preferences.schools)) {
      validationErrors.push('schools must be an array');
    }

    if (preferences.schools) {
      preferences.schools.forEach((school, index) => {
        if (!school.name) {
          validationErrors.push(`schools[${index}].name is required`);
        }
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        ok: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Upsert settings
    const settings = await FamilySettings.findOneAndUpdate(
      { tenantId },
      { preferences },
      { new: true, upsert: true, runValidators: true },
    );

    res.json({
      ok: true,
      settings: {
        tenantId: settings.tenantId,
        preferences: settings.preferences,
        updatedAt: settings.updatedAt,
      },
      message: 'Family settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating family settings:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        ok: false,
        message: 'Validation failed',
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      message: 'Failed to update family settings',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/settings
 * Reset family settings to defaults for the authenticated tenant
 */
router.delete('/', requireAuth, async (req, res) => {
  try {
    const tenantId = req.auth.payload['https://taskpilot-api/tenant'];

    const settings = await FamilySettings.findOneAndUpdate(
      { tenantId },
      {
        preferences: {
          groceryStores: [],
          schools: [],
          neighborhood: '',
          routines: {
            groceryShopping: '',
            schoolPickup: '',
            other: '',
          },
        },
      },
      { new: true, upsert: true },
    );

    res.json({
      ok: true,
      settings: {
        tenantId: settings.tenantId,
        preferences: settings.preferences,
        updatedAt: settings.updatedAt,
      },
      message: 'Family settings reset to defaults',
    });
  } catch (error) {
    console.error('Error resetting family settings:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to reset family settings',
      error: error.message,
    });
  }
});

export default router;
