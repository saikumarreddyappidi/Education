import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

const connectStudentToTeacher = async (
  req: any,
  res: any,
  identifiers: { teacherCode?: string; staffId?: string }
) => {
  const { teacherCode, staffId } = identifiers;
  const studentId = req.user.userId;

  if (!teacherCode && !staffId) {
    return res.status(400).json({ error: 'Teacher code or staff ID is required' });
  }

  // Find the teacher using teacherCode first, fallback to staff ID
  let teacher = null;
  if (teacherCode) {
    teacher = await User.findOne({ teacherCode, role: 'staff' });
  }
  if (!teacher && staffId) {
    teacher = await User.findOne({ registrationNumber: staffId, role: 'staff' });
  }

  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found. Please check and try again.' });
  }

  const codeToStore = teacher.teacherCode;
  if (!codeToStore) {
    return res.status(400).json({ error: 'Selected teacher does not have a sharing code yet.' });
  }

  const student = await User.findById(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  if (!Array.isArray(student.teacherCodes)) {
    student.teacherCodes = [];
  }

  if (!student.teacherCodes.includes(codeToStore)) {
    student.teacherCodes.push(codeToStore);
  }

  if (!student.teacherCode) {
    student.teacherCode = codeToStore;
  }

  await student.save();

  return res.json({
    message: 'Successfully connected to teacher',
    teacherName: teacher.registrationNumber,
    teacherSubject: teacher.subject,
    teacherCode: codeToStore,
    connectedCodes: student.teacherCodes,
    staffName: teacher.registrationNumber,
    staffSubject: teacher.subject
  });
};

// Register
router.post('/register', [
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase, lowercase, number and special character'),
  body('role').isIn(['student', 'staff']).withMessage('Role must be student or staff')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  const { registrationNumber, password, role, year, semester, course, teacherCode, subject } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ registrationNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this registration number' });
    }

    // For staff, check if teacher code is already taken
    if (role === 'staff') {
      // Validate that subject is provided for staff
      if (!subject) {
        return res.status(400).json({ 
          message: 'Subject is required for staff registration',
          field: 'subject'
        });
      }
      
      // If teacher code is provided, check if it's already taken
      if (teacherCode) {
        const existingTeacher = await User.findOne({ teacherCode, role: 'staff' });
        if (existingTeacher) {
          return res.status(400).json({ 
            message: 'Teacher code already exists. Please choose a different code.',
            field: 'teacherCode'
          });
        }
      } else {
        // Auto-generate a unique teacher code if not provided
        let isUnique = false;
        let generatedCode = '';
        let maxAttempts = 10; // Prevent infinite loops
        let attempts = 0;
        
        while (!isUnique && attempts < maxAttempts) {
          attempts++;
          // Generate a random code with a staff prefix
          generatedCode = `TC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          
          // Check if it's unique
          const existingCode = await User.findOne({ teacherCode: generatedCode });
          if (!existingCode) {
            isUnique = true;
          }
        }
        
        // Ensure we have a fallback if all attempts fail
        if (!isUnique) {
          generatedCode = `TC${Date.now()}${Math.floor(Math.random() * 1000)}`;
        }
        
        console.log(`Auto-generated teacher code for staff: ${generatedCode}`);
        req.body.teacherCode = generatedCode;
      }
    }

    // Create user data
    const userData: any = {
      registrationNumber,
      password,
      role,
      year,
      semester,
      teacherCodes: []
    };

    if (role === 'student') {
      userData.course = course;
      if (teacherCode) {
        // Validate teacher code exists
        const teacher = await User.findOne({ teacherCode, role: 'staff' });
        if (!teacher) {
          return res.status(400).json({ message: 'Invalid teacher code' });
        }
        userData.teacherCode = teacherCode;
        userData.teacherCodes = [teacherCode];
      }
    } else if (role === 'staff') {
      userData.subject = subject;
      // Always set teacherCode for staff - either from the request or the auto-generated one
      userData.teacherCode = req.body.teacherCode || teacherCode;
    }

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: (user._id as any).toString(), role: user.role },
      process.env.JWT_SECRET || 'fallback-secret'
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        registrationNumber: user.registrationNumber,
        role: user.role,
        year: user.year,
        semester: user.semester,
        course: user.course,
        subject: user.subject,
        teacherCode: user.teacherCode,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Add more detailed error information for debugging
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace available',
      name: error.name || 'UnknownError',
      code: error.code || 'NO_CODE'
    };
    
    console.error('Registration error details:', JSON.stringify(errorDetails, null, 2));
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      
      return res.status(400).json({
        message: `The ${field} "${value}" is already taken. Please choose another one.`,
        field: field
      });
    }
    
    // Return a more informative error message for all other errors
    res.status(500).json({ 
      message: 'Server error during registration',
      details: process.env.NODE_ENV === 'development' ? errorDetails.message : 'Please try again or contact support.'
    });
  }
});

// Login
router.post('/login', [
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { registrationNumber, password } = req.body;

    // Find user
    const user = await User.findOne({ registrationNumber });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: (user._id as any).toString(), role: user.role },
      process.env.JWT_SECRET || 'fallback-secret'
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        registrationNumber: user.registrationNumber,
        role: user.role,
        year: user.year,
        semester: user.semester,
        course: user.course,
        subject: user.subject,
        teacherCode: user.teacherCode,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        registrationNumber: user.registrationNumber,
        role: user.role,
        year: user.year,
        semester: user.semester,
        course: user.course,
        subject: user.subject,
        teacherCode: user.teacherCode,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Connect student to teacher
router.post('/connect-teacher', auth, async (req: any, res: any) => {
  try {
    const { teacherCode, staffId } = req.body;
    return connectStudentToTeacher(req, res, { teacherCode, staffId });
  } catch (error: any) {
    console.error('Connect teacher error:', error);
    res.status(500).json({ error: 'Server error while connecting to teacher' });
  }
});

router.post('/connect-staff', auth, async (req: any, res: any) => {
  try {
    const { staffId } = req.body;
    return connectStudentToTeacher(req, res, { staffId });
  } catch (error: any) {
    console.error('Connect staff error:', error);
    res.status(500).json({ error: 'Server error while connecting to staff' });
  }
});

export default router;
