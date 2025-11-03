import express from 'express';
import { FilterQuery } from 'mongoose';
import { auth } from '../middleware/auth';
import File, { IFile } from '../models/File';
import User from '../models/User';

const router = express.Router();

interface ParsedDataUrl {
  mimeType: string;
  base64Data: string;
  bufferLength: number;
}

const parseDataUrl = (dataUrl: string): ParsedDataUrl => {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error('Invalid data URL');
  }

  const matches = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!matches || matches.length < 3) {
    throw new Error('Failed to parse data URL');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const bufferLength = Buffer.from(base64Data, 'base64').length;

  return { mimeType, base64Data, bufferLength };
};

const determineFileType = (mimeType: string, fileName: string): 'pdf' | 'image' | 'drawing' | 'document' | 'presentation' => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('image')) return 'image';
  if (/\.(ppt|pptx)$/i.test(fileName)) return 'presentation';
  if (mimeType.includes('msword') || mimeType.includes('officedocument')) return 'document';
  return 'document';
};

const getTeacherCodesForUser = (user: any): string[] => {
  const codes = new Set<string>();
  if (Array.isArray(user.teacherCodes)) {
    user.teacherCodes.forEach((code: string) => {
      if (code) codes.add(code);
    });
  }
  if (user.teacherCode) {
    codes.add(user.teacherCode);
  }
  return Array.from(codes);
};

const toClientFile = (file: any, ownerSubject?: string) => ({
  id: file._id.toString(),
  title: file.fileName,
  filename: file.originalName,
  fileUrl: file.fileUrl || file.fileData || '',
  fileData: file.fileData,
  annotations: file.annotations || [],
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
  authorId: file.uploadedBy.toString(),
  authorName: file.uploaderInfo?.registrationNumber,
  ownerName: file.uploaderInfo?.registrationNumber,
  ownerSubject: ownerSubject || file.uploaderInfo?.subject || null,
  isShared: file.isShared,
  teacherCode: file.teacherCode,
  fileType: file.fileType,
  mimeType: file.mimeType
});

router.get('/', auth, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  const query: FilterQuery<IFile> = user.role === 'staff'
      ? { uploadedBy: req.user.id }
      : {
          $or: [
            { uploadedBy: req.user.id },
            {
              isShared: true,
              teacherCode: { $in: getTeacherCodesForUser(user) }
            }
          ]
        };

    const files = await File.find(query).sort({ updatedAt: -1 });

    res.json(files.map((file) => toClientFile(file)));
  } catch (error: any) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Server error while fetching files' });
  }
});

router.post('/upload', auth, async (req: any, res: any) => {
  try {
    const { filename, fileData, isShared } = req.body || {};

    if (!filename || !fileData) {
      return res.status(400).json({ message: 'Filename and file data are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { mimeType, base64Data, bufferLength } = parseDataUrl(fileData);
    const fileType = determineFileType(mimeType, filename);

    const document = await File.create({
      fileName: filename.replace(/\.[^/.]+$/, ''),
      originalName: filename,
      fileType,
      fileSize: bufferLength,
      fileData: `data:${mimeType};base64,${base64Data}`,
      mimeType,
      uploadedBy: user._id,
      uploaderInfo: {
        registrationNumber: user.registrationNumber,
        role: user.role,
        subject: user.subject,
        year: user.year,
        semester: user.semester,
        course: user.course
      },
  teacherCode: user.role === 'staff' ? (user.teacherCode || undefined) : undefined,
      isShared: user.role === 'staff' ? Boolean(isShared) : false,
      tags: [],
      sharedWith: {}
    });

    res.status(201).json(toClientFile(document, user.subject));
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: error.message || 'Server error while uploading file' });
  }
});

router.put('/:id', auth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { annotations, isShared } = req.body || {};

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this file' });
    }

    if (Array.isArray(annotations)) {
      file.annotations = annotations;
    }

    const user = await User.findById(req.user.id);
    if (user && user.role === 'staff' && typeof isShared === 'boolean') {
  file.isShared = isShared;
  file.teacherCode = isShared && user.teacherCode ? user.teacherCode : undefined;
    }

    await file.save();
    res.json(toClientFile(file, user?.subject));
  } catch (error: any) {
    console.error('Error updating file:', error);
    res.status(500).json({ message: 'Server error while updating file' });
  }
});

router.delete('/:id', auth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    await file.deleteOne();
    res.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Server error while deleting file' });
  }
});

router.post('/save/:id', auth, async (req: any, res: any) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Only students can save shared files' });
    }

    const { id } = req.params;
    const sharedFile = await File.findById(id);

    if (!sharedFile || !sharedFile.isShared) {
      return res.status(404).json({ message: 'Shared file not found' });
    }

    const newFile = await File.create({
      fileName: `${sharedFile.fileName} (copy)`,
      originalName: sharedFile.originalName,
      fileType: sharedFile.fileType,
      fileSize: sharedFile.fileSize,
      fileData: sharedFile.fileData,
      mimeType: sharedFile.mimeType,
      uploadedBy: student._id,
      uploaderInfo: {
        registrationNumber: student.registrationNumber,
        role: student.role,
        subject: student.subject,
        year: student.year,
        semester: student.semester,
        course: student.course
      },
  teacherCode: undefined,
      isShared: false,
      annotations: sharedFile.annotations,
      tags: sharedFile.tags,
      sharedWith: {}
    });

    res.status(201).json(toClientFile(newFile, student.subject));
  } catch (error: any) {
    console.error('Error saving shared file:', error);
    res.status(500).json({ message: 'Server error while saving file' });
  }
});

router.get('/search/:staffId', auth, async (req: any, res: any) => {
  try {
    const { staffId } = req.params;
    const staffUser = await User.findOne({ registrationNumber: staffId, role: 'staff' });

    if (!staffUser) {
      return res.status(404).json({ message: 'Staff not found for provided ID' });
    }

    const sharedFiles = await File.find({
      uploadedBy: staffUser._id,
      isShared: true
    }).sort({ updatedAt: -1 });

    res.json({
      teacherInfo: {
        name: staffUser.registrationNumber,
        subject: staffUser.subject,
        totalFiles: sharedFiles.length,
        teacherCode: staffUser.teacherCode
      },
      files: sharedFiles.map((file) => toClientFile(file, staffUser.subject))
    });
  } catch (error: any) {
    console.error('Error searching staff files:', error);
    res.status(500).json({ message: 'Server error while searching staff files' });
  }
});

export default router;
