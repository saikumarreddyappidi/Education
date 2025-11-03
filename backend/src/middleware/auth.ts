import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const auth = async (req: any, res: any, next: any) => {
  try {
    console.log('🔒 Auth middleware processing request:', {
      path: req.path,
      method: req.method,
      hasAuthHeader: !!req.header('Authorization')
    });
    
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('🚫 No valid authorization header found:', { 
        authHeader: authHeader ? `${authHeader.substring(0, 10)}...` : null 
      });
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        code: 'AUTH_NO_TOKEN'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token received, length:', token.length);
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      req.user = decoded;
      
      // Make sure we have userId available
      req.user.id = decoded.userId || decoded.id || decoded._id;
      req.user.userId = req.user.id; // Ensure userId is also available
      
      console.log('✅ Token verified successfully for user:', {
        userId: req.user.id,
        role: decoded.role || 'unknown'
      });
      
      // Validate that user exists in database if needed
      if (mongoose.connection.readyState === 1) { // If connected to db
        try {
          const User = mongoose.model('User');
          const user = await User.findById(req.user.userId).select('-password');
          
          if (!user) {
            console.warn(`Auth middleware: User ${req.user.userId} not found in database`);
            // Don't fail here as this could be due to using the in-memory db
          } else {
            // Add the full user object (except password) to req
            req.userObject = user;
          }
        } catch (dbError) {
          console.warn('Auth middleware: Failed to verify user in database', dbError);
          // Continue anyway since we verified the token
        }
      }
      
      next();
    } catch (jwtError: any) {
      console.error('JWT Verification failed:', jwtError);
      
      // Provide specific error message based on error type
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired. Please log in again.',
          code: 'AUTH_TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token. Please log in again.',
          code: 'AUTH_INVALID_TOKEN'
        });
      }
      
      return res.status(401).json({ 
        message: 'Token is not valid', 
        error: jwtError.message,
        code: 'AUTH_TOKEN_INVALID'
      });
    }
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication',
      error: error.message,
      code: 'AUTH_SERVER_ERROR'
    });
  }
};
