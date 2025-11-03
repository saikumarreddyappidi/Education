import express from 'express';
import { FilterQuery } from 'mongoose';
import User from '../models/User';
import Whiteboard, { IWhiteboard } from '../models/Whiteboard';
import { auth } from '../middleware/auth';

const router = express.Router();

const getTeacherCodesForUser = (user: any): string[] => {
  const codes = new Set<string>();
  if (Array.isArray(user.teacherCodes)) {
    user.teacherCodes.forEach((code: string) => code && codes.add(code));
  }
  if (user.teacherCode) {
    codes.add(user.teacherCode);
  }
  return Array.from(codes);
};

const toClientWhiteboard = (wb: any, subject?: string) => ({
  id: wb._id.toString(),
  title: wb.title,
  imageData: wb.imageData,
  authorId: wb.authorId.toString(),
  authorName: wb.authorName,
  ownerName: wb.authorName,
  ownerSubject: subject || null,
  isShared: wb.isShared,
  teacherCode: wb.teacherCode,
  createdAt: wb.createdAt,
  updatedAt: wb.updatedAt
});

router.get('/', auth, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  const query: FilterQuery<IWhiteboard> = user.role === 'staff'
      ? { authorId: req.user.id }
      : {
          $or: [
            { authorId: req.user.id },
            {
              isShared: true,
              teacherCode: { $in: getTeacherCodesForUser(user) }
            }
          ]
        };

    const boards = await Whiteboard.find(query).sort({ updatedAt: -1 });
    res.json(boards.map((wb) => toClientWhiteboard(wb, user.subject)));
  } catch (error: any) {
    console.error('Error fetching whiteboards:', error);
    res.status(500).json({ message: 'Server error while fetching whiteboards' });
  }
});

router.post('/', auth, async (req: any, res: any) => {
  try {
    const { title, imageData, isShared } = req.body;

    if (!title || !imageData) {
      return res.status(400).json({ message: 'Title and image data are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const whiteboard = await Whiteboard.create({
      title,
      imageData,
      authorId: user._id,
      authorName: user.registrationNumber,
      teacherCode: user.role === 'staff' && isShared ? (user.teacherCode || undefined) : undefined,
      isShared: user.role === 'staff' ? Boolean(isShared) : false
    });

    res.status(201).json(toClientWhiteboard(whiteboard, user.subject));
  } catch (error: any) {
    console.error('Error creating whiteboard:', error);
    res.status(500).json({ message: 'Server error while creating whiteboard' });
  }
});

router.put('/:id', auth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, imageData, isShared } = req.body;

    const whiteboard = await Whiteboard.findById(id);
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    if (whiteboard.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this whiteboard' });
    }

    if (title) whiteboard.title = title;
    if (imageData) whiteboard.imageData = imageData;

    const user = await User.findById(req.user.id);
    if (user && user.role === 'staff' && typeof isShared === 'boolean') {
  whiteboard.isShared = isShared;
  whiteboard.teacherCode = isShared && user.teacherCode ? user.teacherCode : undefined;
    }

    await whiteboard.save();
    res.json(toClientWhiteboard(whiteboard, user?.subject));
  } catch (error: any) {
    console.error('Error updating whiteboard:', error);
    res.status(500).json({ message: 'Server error while updating whiteboard' });
  }
});

router.delete('/:id', auth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const whiteboard = await Whiteboard.findById(id);

    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    if (whiteboard.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this whiteboard' });
    }

    await whiteboard.deleteOne();
    res.json({ message: 'Whiteboard deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting whiteboard:', error);
    res.status(500).json({ message: 'Server error while deleting whiteboard' });
  }
});

router.post('/save/:id', auth, async (req: any, res: any) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Only students can save shared drawings' });
    }

    const { id } = req.params;
    const sharedBoard = await Whiteboard.findById(id);

    if (!sharedBoard || !sharedBoard.isShared) {
      return res.status(404).json({ message: 'Shared drawing not found' });
    }

    const clone = await Whiteboard.create({
      title: `${sharedBoard.title} (copy)`,
      imageData: sharedBoard.imageData,
      authorId: student._id,
      authorName: student.registrationNumber,
  isShared: false,
  teacherCode: undefined
    });

    res.status(201).json(toClientWhiteboard(clone, student.subject));
  } catch (error: any) {
    console.error('Error saving shared drawing:', error);
    res.status(500).json({ message: 'Server error while saving drawing' });
  }
});

router.get('/search/:staffId', auth, async (req: any, res: any) => {
  try {
    const { staffId } = req.params;
    const staffUser = await User.findOne({ registrationNumber: staffId, role: 'staff' });

    if (!staffUser) {
      return res.status(404).json({ message: 'Staff not found for provided ID' });
    }

    const sharedBoards = await Whiteboard.find({
      authorId: staffUser._id,
      isShared: true
    }).sort({ updatedAt: -1 });

    res.json({
      teacherInfo: {
        name: staffUser.registrationNumber,
        subject: staffUser.subject,
        totalDrawings: sharedBoards.length,
        teacherCode: staffUser.teacherCode
      },
      drawings: sharedBoards.map((wb) => toClientWhiteboard(wb, staffUser.subject))
    });
  } catch (error: any) {
    console.error('Error searching staff drawings:', error);
    res.status(500).json({ message: 'Server error while searching staff drawings' });
  }
});

export default router;
