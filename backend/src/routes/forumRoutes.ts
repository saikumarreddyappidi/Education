import { Router } from 'express';
import {
  getAllQuestions,
  createQuestion,
  getQuestionById,
  addAnswer,
  updateQuestionStatus
} from '../controllers/forumController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/questions')
  .get(getAllQuestions)
  .post(protect, createQuestion);

router.route('/questions/:id')
  .get(getQuestionById);

router.route('/questions/:id/answers')
  .post(protect, addAnswer);

router.route('/questions/:id/status')
    .patch(protect, updateQuestionStatus);

export default router;
