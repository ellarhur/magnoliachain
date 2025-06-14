import { Router } from 'express';
import { register, login } from '../controllers/auth-controller.mjs';

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;