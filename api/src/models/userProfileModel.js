import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema(
  {
    // Auth0 user ID (sub claim from JWT)
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // Tenant/family ID
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    
    // Basic info
    email: {
      type: String,
      required: true,
    },
    
    name: {
      type: String,
      required: true,
    },
    
    // Profile picture (base64 encoded or URL)
    avatar: {
      type: String,
      default: null,
    },
    
    // Avatar type: 'emoji', 'base64', 'url'
    avatarType: {
      type: String,
      enum: ['emoji', 'base64', 'url'],
      default: 'emoji',
    },
    
    // Default emoji if no picture uploaded
    defaultEmoji: {
      type: String,
      default: '👤',
    },
    
    // User preferences
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for tenant + user lookups
userProfileSchema.index({ tenantId: 1, userId: 1 });

// Method to get display avatar (returns emoji or image data)
userProfileSchema.methods.getDisplayAvatar = function () {
  if (this.avatar && this.avatarType !== 'emoji') {
    return {
      type: this.avatarType,
      data: this.avatar,
    };
  }
  return {
    type: 'emoji',
    data: this.avatar || this.defaultEmoji,
  };
};

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;
