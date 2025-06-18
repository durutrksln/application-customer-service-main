const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth.middleware');
const dbService = require('../services/db.service');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage instead of disk storage

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Create a multer instance for multiple files
const uploadFields = upload.fields([
  { name: 'deedFile', maxCount: 1 },
  { name: 'electricalProjectFile', maxCount: 1 },
  { name: 'buildingPermitFile', maxCount: 1 },
  { name: 'permitDocumentFile', maxCount: 1 },
  { name: 'law6292File', maxCount: 1 },
  { name: 'law3194File', maxCount: 1 }
]);

// Create new connection application
router.post('/', authenticateToken, uploadFields, async (req, res) => {
  try {
    const {
      fullName,
      tckn,
      requiresLicense
    } = req.body;

    const files = req.files;
    
    // Get file buffers
    const deedFileData = files.deedFile ? files.deedFile[0].buffer : null;
    const electricalProjectData = files.electricalProjectFile ? files.electricalProjectFile[0].buffer : null;
    const buildingPermitData = files.buildingPermitFile ? files.buildingPermitFile[0].buffer : null;
    const permitDocumentData = files.permitDocumentFile ? files.permitDocumentFile[0].buffer : null;
    const law6292Data = files.law6292File ? files.law6292File[0].buffer : null;
    const law3194Data = files.law3194File ? files.law3194File[0].buffer : null;

    // Insert into database
    const query = `
      INSERT INTO connection_applications (
        user_id,
        full_name,
        tckn,
        deed_file_data,
        electrical_project_data,
        building_permit_data,
        requires_license,
        permit_document_data,
        law_6292_data,
        law_3194_data,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `;

    const values = [
      req.user.userId,
      fullName,
      tckn,
      deedFileData,
      electricalProjectData,
      buildingPermitData,
      requiresLicense === 'yes',
      permitDocumentData,
      law6292Data,
      law3194Data,
      'pending'
    ];

    const result = await dbService.query(query, values);

    res.status(201).json({
      message: 'Connection application submitted successfully',
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting connection application:', error);
    res.status(500).json({
      message: 'Error submitting connection application',
      error: error.message
    });
  }
});

// Add a route to download PDF files
router.get('/:id/file/:fileType', authenticateToken, async (req, res) => {
  try {
    const { id, fileType } = req.params;
    
    // Map fileType to column name
    const fileTypeMap = {
      'deed': 'deed_file_data',
      'electrical': 'electrical_project_data',
      'building': 'building_permit_data',
      'permit': 'permit_document_data',
      'law6292': 'law_6292_data',
      'law3194': 'law_3194_data'
    };

    const columnName = fileTypeMap[fileType];
    if (!columnName) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    const query = `
      SELECT ${columnName}, full_name, tckn
      FROM connection_applications
      WHERE id = $1 AND user_id = $2
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
    res.setHeader('Content-Disposition', `attachment; filename=${fileType}_${result.rows[0].tckn}.pdf`);
    
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

module.exports = router; 