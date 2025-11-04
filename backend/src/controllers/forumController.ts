import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import Question from '../models/Question';
import User from '../models/User';

// @desc    Get all questions
// @route   GET /api/forum/questions
// @access  Public
export const getAllQuestions = asyncHandler(async (_req: Request, res: Response) => {
  const questions = await Question.find({})
    .sort({ createdAt: -1 })
    .populate('author', 'registrationNumber role teacherCode')
    .populate('answers.author', 'registrationNumber role teacherCode')
    .populate('assignedTeacher', 'registrationNumber teacherCode subject role');
  res.json(questions);
});

// @desc    Get question by ID
// @route   GET /api/forum/questions/:id
// @access  Public
export const getQuestionById = asyncHandler(async (req: Request, res: Response) => {
  const question = await Question.findById(req.params.id)
    .populate('author', 'registrationNumber role teacherCode')
    .populate('answers.author', 'registrationNumber role teacherCode')
    .populate('assignedTeacher', 'registrationNumber teacherCode subject role');

  if (question) {
    res.json(question);
  } else {
    res.status(404);
    throw new Error('Question not found');
  }
});

// @desc    Create a new question
// @route   POST /api/forum/questions
// @access  Private
export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, tags, teacherCode } = req.body;
  const user = (req as any).user; // from protect middleware

  const question = new Question({
    title,
    content,
    tags,
    author: user._id,
  });

  if (teacherCode) {
    const teacher = await User.findOne({ teacherCode, role: 'staff' });
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher not found for provided code');
    }
    question.assignedTeacher = teacher._id as Types.ObjectId;
    question.assignedTeacherCode = teacher.teacherCode;
  }

  await question.save();
  await question.populate([
    { path: 'author', select: 'registrationNumber role teacherCode' },
    { path: 'assignedTeacher', select: 'registrationNumber teacherCode subject role' },
  ]);
  res.status(201).json(question);
});

// @desc    Add an answer to a question
// @route   POST /api/forum/questions/:id/answers
// @access  Private
export const addAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body;
  const user = (req as any).user;

  const question = await Question.findById(req.params.id);

  if (question) {
    const answer = {
      content,
      author: user._id,
      createdAt: new Date(),
    };

    question.answers.push(answer as any);
    await question.save();

    const refreshedQuestion = await Question.findById(req.params.id).select('answers');

    if (!refreshedQuestion) {
      res.status(500);
      throw new Error('Failed to load saved answer');
    }

    await refreshedQuestion.populate('answers.author', 'registrationNumber role teacherCode');

    const savedAnswer = refreshedQuestion.answers[refreshedQuestion.answers.length - 1];
    res.status(201).json(savedAnswer);
  } else {
    res.status(404);
    throw new Error('Question not found');
  }
});

// @desc    Update question status
// @route   PATCH /api/forum/questions/:id/status
// @access  Private (should be restricted to author or teachers)
export const updateQuestionStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const user = (req as any).user;

  const question = await Question.findById(req.params.id);

  if (question) {
    // Basic authorization: only author or a staff member can change status
    const isAuthor = question.author.toString() === user._id.toString();
    const isStaff = user.role === 'staff';

    if (!isAuthor && !isStaff) {
      res.status(403);
      throw new Error('User not authorized to update this question');
    }

    if (status === 'open' || status === 'resolved') {
      question.status = status;
      await question.save();
      await question.populate([
        { path: 'author', select: 'registrationNumber role teacherCode' },
        { path: 'answers.author', select: 'registrationNumber role teacherCode' },
        { path: 'assignedTeacher', select: 'registrationNumber teacherCode subject role' },
      ]);
      res.json(question);
    } else {
      res.status(400);
      throw new Error('Invalid status');
    }
  } else {
    res.status(404);
    throw new Error('Question not found');
  }
});
