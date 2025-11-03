import express from 'express';
import { auth } from '../middleware/auth';
import { getUserRecoveryData, deleteRecoveryFile } from '../middleware/errorRecovery';
import path from 'path';

const router = express.Router();

// Get recovery data for current user
router.get('/user-recovery-data', auth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const recoveryData = getUserRecoveryData(userId);
    
    res.json({
      success: true,
      recoveryData
    });
  } catch (error: any) {
    console.error('Error retrieving recovery data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve recovery data',
      error: error.message 
    });
  }
});

// Delete a specific recovery file
router.delete('/user-recovery-data/:filename', auth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { filename } = req.params;
    
    // Security check - only allow deletion of own files
    if (!filename.startsWith(`${userId}_`)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this recovery file'
      });
    }
    
    const filePath = path.join(__dirname, '../../recovery-data', filename);
    const deleted = deleteRecoveryFile(filePath);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Recovery data deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Recovery file not found or could not be deleted'
      });
    }
  } catch (error: any) {
    console.error('Error deleting recovery data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete recovery data',
      error: error.message 
    });
  }
});

export default router;
