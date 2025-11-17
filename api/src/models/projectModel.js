import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    ownerSub: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    tags: { type: [String], default: [] },
    dueDate: { type: Date },
    tenantId: { type: String, required: true, index: true }, // ✅ required for multi-tenant isolation
  },
  { timestamps: true },
);

// Compound index for efficient tenant-scoped queries
projectSchema.index({ tenantId: 1, ownerSub: 1 });
projectSchema.index({ tenantId: 1, status: 1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;
