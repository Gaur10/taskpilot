import { Router } from 'express';
const router = Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, message: '🌐 Public route — no token needed.' });
});

export default router;
