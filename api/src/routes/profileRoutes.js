import express from 'express';
import UserProfile from '../models/userProfileModel.js';
import { requireAuth } from '../middleware/auth.js';
import { injectMockTenant } from '../middleware/injectMockTenant.js';

const router = express.Router();

// Conditional middleware based on environment
const allowMocks = (process.env.NODE_ENV !== 'production') || (process.env.ALLOW_MOCK_AUTH === 'true');
const maybeInjectMockTenant = allowMocks ? injectMockTenant : (req, res, next) => next();

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', requireAuth, maybeInjectMockTenant, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const tenantId = req.auth.payload['https://taskpilot-api/tenant'] || 'tenant-A';
    
    let profile = await UserProfile.findOne({ userId, tenantId });
    
    // Create profile if doesn't exist
    if (!profile) {
      const email = req.auth.payload.email || 
                    req.auth.payload['https://taskpilot-api/email'] || 
                    `user-${userId.substring(0, 8)}@taskpilot.app`;
      const name = req.auth.payload.name || 
                   req.auth.payload['https://taskpilot-api/name'] || 
                   req.auth.payload.nickname ||
                   email.split('@')[0];
      
      console.log('Creating profile with:', { userId, tenantId, email, name });
      
      profile = await UserProfile.create({
        userId,
        tenantId,
        email,
        name,
        defaultEmoji: '👤',
      });
    }
    
    res.json({
      ok: true,
      profile: {
        userId: profile.userId,
        email: profile.email,
        name: profile.name,
        avatar: profile.getDisplayAvatar(),
        preferences: profile.preferences,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
});

/**
 * PUT /api/profile
 * Update current user's profile
 */
router.put('/', requireAuth, maybeInjectMockTenant, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const tenantId = req.auth.payload['https://taskpilot-api/tenant'] || 'tenant-A';
    const { name, avatar, avatarType, defaultEmoji, preferences } = req.body;
    
    // Validate avatar size if base64 (limit to 1MB)
    if (avatarType === 'base64' && avatar) {
      const sizeInBytes = Buffer.from(avatar.split(',')[1] || avatar, 'base64').length;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 1) {
        return res.status(400).json({
          ok: false,
          message: 'Avatar image too large. Maximum size is 1MB.',
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (avatarType) updateData.avatarType = avatarType;
    if (defaultEmoji) updateData.defaultEmoji = defaultEmoji;
    if (preferences) updateData.preferences = preferences;
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId, tenantId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!profile) {
      return res.status(404).json({
        ok: false,
        message: 'Profile not found',
      });
    }
    
    res.json({
      ok: true,
      profile: {
        userId: profile.userId,
        email: profile.email,
        name: profile.name,
        avatar: profile.getDisplayAvatar(),
        preferences: profile.preferences,
        updatedAt: profile.updatedAt,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

/**
 * GET /api/profile/family
 * Get all profiles in the same family/tenant
 */
router.get('/family', requireAuth, maybeInjectMockTenant, async (req, res) => {
  try {
    const tenantId = req.auth.payload['https://taskpilot-api/tenant'] || 'tenant-A';
    
    const profiles = await UserProfile.find({ tenantId }).sort({ name: 1 });
    
    res.json({
      ok: true,
      profiles: profiles.map(p => ({
        userId: p.userId,
        email: p.email,
        name: p.name,
        avatar: p.getDisplayAvatar(),
      })),
    });
  } catch (error) {
    console.error('Error fetching family profiles:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch family profiles',
      error: error.message,
    });
  }
});

export default router;
