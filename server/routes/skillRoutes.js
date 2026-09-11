import express from 'express';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../controllers/skillController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getSkills).post(protect, admin, createSkill);
router
  .route('/:id')
  .put(protect, admin, updateSkill)
  .delete(protect, admin, deleteSkill);

export default router;
