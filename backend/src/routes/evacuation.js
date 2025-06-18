const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  createEvacuationApplication,
  getUserEvacuationApplications,
  getEvacuationApplicationById,
  updateEvacuationApplicationStatus
} = require('../controllers/evacuationController');
const dbService = require('../services/db.service');

// Add express.urlencoded middleware to handle form data
router.use(express.urlencoded({ extended: true }));

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
  { name: 'nufusCuzdani', maxCount: 1 },
  { name: 'mulkiyetBelgesi', maxCount: 1 }
]);

// Debug middleware
router.use((req, res, next) => {
  console.log('Evacuation route accessed:', req.method, req.path);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  next();
});

// Rotalar
router.post('/', authenticateToken, uploadFields, async (req, res) => {
  try {
    console.log('Form data received:', req.body);
    console.log('Files received:', req.files);

    const {
      fullName,
      tckn,
      address,
      phoneNumber,
      email,
      evacuationReason,
      evacuationDate,
      requiresLicense,
      userType,
      tesisatNumarasi,
      daskPoliceNumarasi,
      zorunluDepremSigortasi,
      iban,
      landlordType,
      mulkSahibiAdSoyad,
      vergiNumarasi,
      tuzelKisiAd,
      tuzelKisiSoyad,
      unvan
    } = req.body;

    // Validate required fields
    if (!fullName || !tckn || !address || !phoneNumber || !email || !evacuationReason || !evacuationDate) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: {
          fullName: !fullName,
          tckn: !tckn,
          address: !address,
          phoneNumber: !phoneNumber,
          email: !email,
          evacuationReason: !evacuationReason,
          evacuationDate: !evacuationDate
        }
      });
    }

    const files = req.files;
    
    // Validate required files
    if (!files.nufusCuzdani || !files.mulkiyetBelgesi) {
      return res.status(400).json({
        message: 'Missing required files',
        required: {
          nufusCuzdani: !files.nufusCuzdani,
          mulkiyetBelgesi: !files.mulkiyetBelgesi
        }
      });
    }
    
    // Get file buffers
    const nufusCuzdaniData = files.nufusCuzdani[0].buffer;
    const mulkiyetBelgesiData = files.mulkiyetBelgesi[0].buffer;

    // Insert into database
    const query = `
      INSERT INTO evacuation_applications (
        user_id,
        user_type,
        full_name,
        tckn,
        address,
        phone_number,
        email,
        evacuation_reason,
        evacuation_date,
        tesisat_numarasi,
        dask_police_numarasi,
        zorunlu_deprem_sigortasi,
        iban,
        landlord_type,
        mulk_sahibi_ad_soyad,
        vergi_numarasi,
        tuzel_kisi_ad,
        tuzel_kisi_soyad,
        unvan,
        nufus_cuzdani_data,
        mulkiyet_belgesi_data,
        requires_license,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;

    const values = [
      req.user.userId,
      userType,
      fullName,
      tckn,
      address,
      phoneNumber,
      email,
      evacuationReason,
      evacuationDate,
      tesisatNumarasi,
      daskPoliceNumarasi,
      zorunluDepremSigortasi,
      iban,
      landlordType,
      mulkSahibiAdSoyad,
      vergiNumarasi,
      tuzelKisiAd,
      tuzelKisiSoyad,
      unvan,
      nufusCuzdaniData,
      mulkiyetBelgesiData,
      requiresLicense === 'yes',
      'pending'
    ];

    const result = await dbService.query(query, values);

    res.status(201).json({
      message: 'Evacuation application submitted successfully',
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting evacuation application:', error);
    res.status(500).json({
      message: 'Error submitting evacuation application',
      error: error.message
    });
  }
});

// GET /evacuation/pending
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM evacuation_applications 
      WHERE user_id = $1 AND (status = 'pending' OR status = 'in_review')
      ORDER BY created_at DESC
    `;
    const result = await dbService.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending evacuations:', error);
    res.status(500).json({ 
      message: 'Error fetching pending evacuations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /evacuation/completed
router.get('/completed', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM evacuation_applications 
      WHERE user_id = $1 AND (status = 'approved' OR status = 'rejected')
      ORDER BY created_at DESC
    `;
    const result = await dbService.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching completed evacuations:', error);
    res.status(500).json({ 
      message: 'Error fetching completed evacuations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/my-applications', authenticateToken, getUserEvacuationApplications);
router.get('/:id', authenticateToken, getEvacuationApplicationById);
router.patch('/:id/status', authenticateToken, updateEvacuationApplicationStatus);

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
      FROM evacuation_applications
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