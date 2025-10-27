import { Router } from 'express';
const router = Router();

/**
 * @openapi
 * /public:
 *   get:
 *     summary: Public endpoint
 *     description: Accessible without authentication.
 *     responses:
 *       200:
 *         description: Returns a simple public message.
 */
router.get('/', (_req, res) => {
  res.json({ ok: true, message: '🌐 Public route — no token needed.' });
});

export default router;
