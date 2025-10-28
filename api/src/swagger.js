import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskPilot API Docs",
      version: "1.0.0",
      description: "API documentation for TaskPilot backend (Auth0 + MongoDB)",
    },
    servers: [{ url: "http://localhost:4000/api" }],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    tags: [
        {
          name: "Projects",
          description: "CRUD operations for managing user or tenant-specific projects in TaskPilot.",
        },
    ],
    // 👇 Add this block globally for all endpoints
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // 👇 Ensure Swagger scans all route files
  apis: [path.join(__dirname, "routes/*.js")],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
