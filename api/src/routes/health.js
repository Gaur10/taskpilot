import { Router } from 'express';
const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check for TaskPilot API
 *     description: Returns OK if the API server is alive.
 *     responses:
 *       200:
 *         description: Successful health check
 */
router.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'taskpilot-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
