import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    ownerSub: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
    tags: { type: [String], default: [] },
    dueDate: { type: Date },
    tenantId: { type: String, required: false }, // ✅ optional for now
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
