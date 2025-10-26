import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
    },
    description: {
      type: String,
      default: "",
    },
    tenantId: {
      type: String,
      required: true,
      index: true, // helps query by tenant
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
  }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
