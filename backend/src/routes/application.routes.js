const express = require('express');
const router = express.Router();
const appController = require('../controllers/application.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const dbService = require('../services/db.service');
// const documentRoutes = require('./document.routes'); // For nested document routes

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage instead of disk storage

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// GET /applications/dashboard
router.get('/dashboard', authenticateToken, appController.getDashboard);

// GET /applications/pending-subscriptions
router.get('/pending-subscriptions', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM applications 
      WHERE user_id = $1 AND (status = 'pending' OR status = 'in_review') AND application_type = 'new_installation'
      ORDER BY submitted_at DESC
    `;
    const result = await dbService.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending subscriptions:', error);
    res.status(500).json({ 
      message: 'Error fetching pending subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /applications/pending
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM connection_applications 
      WHERE user_id = $1 AND (status = 'pending' OR status = 'in_review')
      ORDER BY created_at DESC
    `;
    const result = await dbService.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({ 
      message: 'Error fetching pending applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /applications/completed-subscriptions
router.get('/completed-subscriptions', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM applications 
      WHERE user_id = $1 AND (status = 'approved' OR status = 'rejected') AND application_type = 'new_installation'
      ORDER BY submitted_at DESC
    `;
    const result = await dbService.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching completed subscriptions:', error);
    res.status(500).json({ 
      message: 'Error fetching completed subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /applications/completed-applications
router.get('/completed-applications', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM connection_applications 
      WHERE user_id = $1 AND (status = 'approved' OR status = 'rejected')
      ORDER BY created_at DESC
    `;
    const result = await dbService.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching completed applications:', error);
    res.status(500).json({ 
      message: 'Error fetching completed applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /applications
router.post('/', authenticateToken, upload.fields([
  { name: 'old_bill_file', maxCount: 1 },
  { name: 'proxy_document', maxCount: 1 },
  { name: 'dask_policy_file', maxCount: 1 },
  { name: 'ownership_document', maxCount: 1 }
]), appController.createApp);

// GET /applications
router.get('/', authenticateToken, appController.listApps);

// GET /applications/:applicationId
router.get('/:applicationId', authenticateToken, appController.getApp);

// PUT /applications/:applicationId
router.put('/:applicationId', authenticateToken, appController.updateApp);

// DELETE /applications/:applicationId
router.delete('/:applicationId', authenticateToken, appController.deleteApp); // Consider isAdmin or specific logic

// Add a route to download PDF files
router.get('/:id/file/:fileType', authenticateToken, async (req, res) => {
  try {
    const { id, fileType } = req.params;
    
    // Map fileType to column name
    const fileTypeMap = {
      'old_bill': 'old_bill_file_data',
      'proxy': 'proxy_document_data',
      'dask_policy': 'dask_policy_file_data',
      'ownership': 'ownership_document_data'
    };

    const columnName = fileTypeMap[fileType];
    if (!columnName) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    const query = `
      SELECT ${columnName}, applicant_name, application_id
      FROM applications
      WHERE application_id = $1 AND user_id = $2
    `;

    const result = await dbService.query(query, [id, req.user.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const fileData = result.rows[0][columnName];
    if (!fileData) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileType}_${result.rows[0].application_id}.pdf`);
    
    // Send the file data
    res.send(fileData);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      message: 'Error downloading file',
      error: error.message
    });
  }
});

// Nested document routes (Example)
// router.use('/:applicationId/documents', documentRoutes);

module.exports = router;