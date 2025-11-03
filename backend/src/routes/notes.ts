import express from 'express';
import { body, validationResult } from 'express-validator';
import Note from '../models/Note';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import mongoose from 'mongoose';
// Import helpers for PDFs and whiteboards so we can include them in staff search
import File from '../models/File';
import Whiteboard from '../models/Whiteboard';

const router = express.Router();

// Get all notes (user's notes + shared notes from teachers)
router.get('/', auth, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query: any;

    if (user.role === 'staff') {
      // Staff sees only their own notes
      query = { authorId: req.user.id };
    } else {
      // Students see their own notes + shared notes from connected teachers
      const userTeacherCodes = user.teacherCodes || [];
      
      query = {
        $or: [
          { authorId: req.user.id }, // User's own notes
          { 
            isShared: true,
            teacherCode: { $in: userTeacherCodes }
          }
        ]
      };
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error: any) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Convenience route for clients that request /my
router.get('/my', auth, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query: any;

    if (user.role === 'staff') {
      query = { authorId: req.user.id };
    } else {
      const userTeacherCodes = user.teacherCodes || [];
      query = {
        $or: [
          { authorId: req.user.id },
          {
            isShared: true,
            teacherCode: { $in: userTeacherCodes }
          }
        ]
      };
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error: any) {
    console.error('Get my notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search notes
router.get('/search', auth, async (req: any, res: any) => {
  try {
    const { q, tags } = req.query;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query: any;

    if (user.role === 'staff') {
      // Staff sees only their own notes
      query = { authorId: req.user.id };
    } else {
      // Students see their own notes + shared notes from connected teachers
      const userTeacherCodes = user.teacherCodes || [];
      
      query = {
        $or: [
          { authorId: req.user.id }, // User's own notes
          { 
            isShared: true,
            teacherCode: { $in: userTeacherCodes }
          }
        ]
      };
    }

    // Add search criteria
    if (q) {
      query.$text = { $search: q };
    }

    if (tags && tags.length > 0) {
      const tagArray = tags.split(',').map((tag: string) => tag.trim());
      query.tags = { $in: tagArray };
    }

    const notes = await Note.find(query).sort({ score: { $meta: 'textScore' } });
    res.json(notes);
  } catch (error: any) {
    console.error('Search notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create note
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req: any, res: any) => {
  try {
    console.log('📝 Creating note request:', {
      userId: req.user?.id,
      title: req.body.title?.substring(0, 30),
      contentLength: req.body.content?.length || 0,
      hasTags: !!req.body.tags,
      isShared: req.body.isShared || req.body.shared
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('⚠️ Validation errors in create note:', errors.array());
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array(),
        code: 'VALIDATION_ERROR'
      });
    }

    // Extract data, handling both isShared and shared fields for backward compatibility
    const { title, content, tags } = req.body;
    const isShared = req.body.isShared || req.body.shared || false;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('❌ User not found for ID:', req.user.id);
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const noteData: any = {
      title,
      content,
      tags: tags || [],
      authorId: req.user.id,
      authorName: user.registrationNumber || 'Unknown',
      isShared: false
    };

    // Only staff can share notes
    if (user.role === 'staff' && isShared) {
      noteData.isShared = true;
      noteData.teacherCode = user.teacherCode;
    }

    const note = new Note(noteData);
    await note.save();

    res.status(201).json(note);
  } catch (error: any) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update note
router.put('/:id', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req: any, res: any) => {
  try {
    console.log('🔄 Updating note request:', {
      userId: req.user?.id,
      noteId: req.params.id,
      title: req.body.title?.substring(0, 30),
      contentLength: req.body.content?.length || 0,
      hasTags: !!req.body.tags,
      isShared: req.body.isShared || req.body.shared
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('⚠️ Validation errors in update note:', errors.array());
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors.array(),
        code: 'VALIDATION_ERROR' 
      });
    }

    // Extract data, handling both isShared and shared fields for backward compatibility
    const { title, content, tags } = req.body;
    const isShared = req.body.isShared || req.body.shared || false;
    
    const note = await Note.findById(req.params.id);

    if (!note) {
      console.warn('⚠️ Note not found:', req.params.id);
      return res.status(404).json({ 
        message: 'Note not found',
        code: 'NOTE_NOT_FOUND'
      });
    }

    // Check if user owns the note
    if (note.authorId.toString() !== req.user.id) {
      console.warn('⚠️ Unauthorized update attempt:', {
        noteAuthor: note.authorId.toString(),
        requestUser: req.user.id
      });
      return res.status(403).json({ 
        message: 'Not authorized to update this note',
        code: 'NOTE_UPDATE_UNAUTHORIZED'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('❌ User not found for ID:', req.user.id);
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Update note
    note.title = title;
    note.content = content;
    note.tags = tags || [];

    // Only staff can share notes
    if (user.role === 'staff') {
      note.isShared = isShared || false;
      if (note.isShared) {
        note.teacherCode = user.teacherCode;
      } else {
        note.teacherCode = undefined;
      }
    }

    await note.save();
    res.json(note);
  } catch (error: any) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete note
router.delete('/:id', auth, async (req: any, res: any) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if user owns the note
    if (note.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search for staff notes by staff ID/registration number
router.get('/search/:staffId', auth, async (req: any, res: any) => {
  try {
    const { staffId } = req.params;
    
    // Find the staff user
    const staffUser = await User.findOne({ 
      registrationNumber: staffId,
      role: 'staff'
    });

    if (!staffUser) {
      return res.status(404).json({ 
        message: 'Staff not found',
        code: 'STAFF_NOT_FOUND'
      });
    }

    // Find all shared notes by this staff
    const notes = await Note.find({
      authorId: staffUser._id,
      isShared: true
    }).sort({ updatedAt: -1 });

    const [teacherFiles, teacherWhiteboards] = await Promise.all([
      File.find({ uploadedBy: staffUser._id, isShared: true }).sort({ updatedAt: -1 }),
      Whiteboard.find({ authorId: staffUser._id, isShared: true }).sort({ updatedAt: -1 })
    ]);

    const mapFile = (file: any) => ({
      id: file._id.toString(),
      title: file.fileName,
      filename: file.originalName,
      fileUrl: file.fileUrl || file.fileData || '',
      fileData: file.fileData,
      ownerName: file.uploaderInfo?.registrationNumber,
      ownerSubject: file.uploaderInfo?.subject || staffUser.subject,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      isShared: file.isShared,
      teacherCode: file.teacherCode
    });

    const mapWhiteboard = (wb: any) => ({
      id: wb._id.toString(),
      title: wb.title,
      imageData: wb.imageData,
      ownerName: wb.authorName,
      ownerSubject: staffUser.subject || null,
      createdAt: wb.createdAt,
      updatedAt: wb.updatedAt,
      isShared: wb.isShared,
      teacherCode: wb.teacherCode
    });

    res.json({
      teacherInfo: {
        name: staffUser.registrationNumber,
        subject: staffUser.subject || 'Not specified',
        totalNotes: notes.length,
        totalPdfs: teacherFiles.length,
        totalWhiteboards: teacherWhiteboards.length,
        teacherCode: staffUser.teacherCode
      },
      notes,
      pdfs: teacherFiles.map(mapFile),
      whiteboards: teacherWhiteboards.map(mapWhiteboard)
    });
  } catch (error: any) {
    console.error('Search staff notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save a staff note to student's account
router.post('/save/:noteId', auth, requireRole('student'), async (req: any, res: any) => {
  try {
    const { noteId } = req.params;
    
    // Verify the user is a student
    const student = await User.findById(req.user.id);
    if (!student || student.role !== 'student') {
      return res.status(403).json({ 
        message: 'Only students can save staff notes',
        code: 'NOT_STUDENT'
      });
    }

    // Find the original note
    const originalNote = await Note.findById(noteId);
    if (!originalNote || !originalNote.isShared) {
      return res.status(404).json({ 
        message: 'Note not found or not shared',
        code: 'NOTE_NOT_FOUND'
      });
    }

    // Create a copy of the note for the student
    const newNote = new Note({
      title: `${originalNote.title} (from ${originalNote.authorName})`,
      content: originalNote.content,
      tags: [...originalNote.tags, 'saved-from-staff'],
      authorId: req.user.id,
      authorName: student.registrationNumber,
      isShared: false
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error: any) {
    console.error('Save staff note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
