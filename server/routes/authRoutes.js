import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';

const router = express.Router();

const loginRules = {
  email: { required: true, label: 'Email', type: 'email', max: 200 },
  password: { required: true, label: 'Password', min: 6, max: 200 },
};

const registerRules = {
  name: { required: true, label: 'Name', min: 2, max: 100 },
  ...loginRules,
};

// User creation is admin-only: this is a single-owner portfolio, so public
// self-registration would let anyone create accounts on the API.
router.post('/register', protect, admin, validateBody(registerRules), registerUser);
router.post('/login', validateBody(loginRules), loginUser);
router.get('/me', protect, getMe);

export default router;
