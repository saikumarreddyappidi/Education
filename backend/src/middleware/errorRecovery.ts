import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Directory for storing recovery data
const RECOVERY_DIR = path.join(__dirname, '../../recovery-data');

// Ensure recovery directory exists
if (!fs.existsSync(RECOVERY_DIR)) {
  fs.mkdirSync(RECOVERY_DIR, { recursive: true });
}

/**
 * Middleware to capture request body for recovery in case of errors
 */
export const captureRequestData = (req: Request, res: Response, next: NextFunction) => {
  // Only capture POST, PUT requests with JSON bodies
  if ((req.method === 'POST' || req.method === 'PUT') && 
      req.headers['content-type']?.includes('application/json') &&
      req.body) {
    
    // Store original data
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const userId = (req as any).user?.userId || 'anonymous';
    const endpoint = req.originalUrl.replace(/\//g, '_');
    const filename = `${userId}_${endpoint}_${timestamp}.json`;
    
    try {
      // Write recovery data to file
      fs.writeFileSync(
        path.join(RECOVERY_DIR, filename),
        JSON.stringify({
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          userId,
          timestamp: new Date().toISOString()
        }, null, 2)
      );
    } catch (error) {
      console.error('Error saving recovery data:', error);
      // Don't fail the request if recovery saving fails
    }
  }
  
  next();
};

/**
 * Get recovery data for a specific user
 */
export const getUserRecoveryData = (userId: string) => {
  try {
    if (!fs.existsSync(RECOVERY_DIR)) return [];
    
    const files = fs.readdirSync(RECOVERY_DIR);
    const userFiles = files.filter(f => f.startsWith(`${userId}_`));
    
    return userFiles.map(file => {
      const filePath = path.join(RECOVERY_DIR, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        console.error(`Error reading recovery file ${file}:`, error);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('Error getting user recovery data:', error);
    return [];
  }
};

/**
 * Delete a specific recovery file
 */
export const deleteRecoveryFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting recovery file:', error);
    return false;
  }
};
