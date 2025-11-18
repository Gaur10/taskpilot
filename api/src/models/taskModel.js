import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    ownerSub: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    tags: { type: [String], default: [] },
    dueDate: { type: Date },
    tenantId: { type: String, required: true, index: true }, // Family identifier
    
    // Family calendar assignment fields
    assignedToEmail: { type: String, default: null, trim: true },
    assignedToName: { type: String, default: null, trim: true },
    createdByEmail: { type: String, required: true, trim: true },
    createdByName: { type: String, required: true, trim: true },
    
    // Activity log for task history
    activityLog: [{
      action: { 
        type: String, 
        enum: ['created', 'assigned', 'reassigned', 'unassigned', 'status_changed', 'updated', 'completed'],
        required: true,
      },
      performedBy: { type: String, required: true }, // email of user who made the change
      performedByName: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      changes: { type: mongoose.Schema.Types.Mixed }, // stores old/new values
    }],
  },
  { timestamps: true },
);

// Virtual property to check if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'done') {
    return false;
  }
  return new Date() > new Date(this.dueDate);
});

// Compound indexes for efficient family-scoped queries
taskSchema.index({ tenantId: 1, ownerSub: 1 });
taskSchema.index({ tenantId: 1, status: 1 });
taskSchema.index({ tenantId: 1, assignedToEmail: 1 }); // For "My Tasks" view
taskSchema.index({ tenantId: 1, dueDate: 1 }); // For weekly calendar view

const Task = mongoose.model('Task', taskSchema);
export default Task;
