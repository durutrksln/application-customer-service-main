const db = require('../services/db.service');
const path = require('path');
const fs = require('fs');

// Yeni tahliye başvurusu oluştur
exports.createEvacuationApplication = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received files:', req.files);

    // Handle file uploads
    let nufusCuzdaniPath = null;
    let mulkiyetBelgesiPath = null;

    if (req.files) {
      if (req.files.nufusCuzdani && req.files.nufusCuzdani[0]) {
        nufusCuzdaniPath = req.files.nufusCuzdani[0].filename;
      }

      if (req.files.mulkiyetBelgesi && req.files.mulkiyetBelgesi[0]) {
        mulkiyetBelgesiPath = req.files.mulkiyetBelgesi[0].filename;
      }
    }

    // Transform the data to match our database schema
    const applicationData = {
      user_id: req.user.userId,
      user_type: req.body.userType,
      nufus_cuzdani_path: nufusCuzdaniPath,
      mulkiyet_belgesi_path: mulkiyetBelgesiPath,
      tesisat_numarasi: req.body.tesisatNumarasi,
      dask_police_numarasi: req.body.daskPoliceNumarasi,
      zorunlu_deprem_sigortasi: req.body.zorunluDepremSigortasi,
      iban: req.body.iban,
      landlord_type: req.body.landlordType,
      mulk_sahibi_ad_soyad: req.body.mulkSahibiAdSoyad,
      vergi_numarasi: req.body.vergiNumarasi,
      tuzel_kisi_ad: req.body.tuzelKisiAd,
      tuzel_kisi_soyad: req.body.tuzelKisiSoyad,
      unvan: req.body.unvan,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    console.log('Transformed application data:', applicationData);

    const result = await db.query(
      `INSERT INTO evacuation_applications (
        user_id, user_type, nufus_cuzdani_path, mulkiyet_belgesi_path,
        tesisat_numarasi, dask_police_numarasi, zorunlu_deprem_sigortasi,
        iban, landlord_type, mulk_sahibi_ad_soyad, vergi_numarasi,
        tuzel_kisi_ad, tuzel_kisi_soyad, unvan, status,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        applicationData.user_id,
        applicationData.user_type,
        applicationData.nufus_cuzdani_path,
        applicationData.mulkiyet_belgesi_path,
        applicationData.tesisat_numarasi,
        applicationData.dask_police_numarasi,
        applicationData.zorunlu_deprem_sigortasi,
        applicationData.iban,
        applicationData.landlord_type,
        applicationData.mulk_sahibi_ad_soyad,
        applicationData.vergi_numarasi,
        applicationData.tuzel_kisi_ad,
        applicationData.tuzel_kisi_soyad,
        applicationData.unvan,
        applicationData.status,
        applicationData.created_at,
        applicationData.updated_at
      ]
    );

    console.log('Application saved successfully:', result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Tahliye başvurunuz başarıyla alındı',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating evacuation application:', error);
    
    res.status(500).json({
      success: false,
      message: 'Başvuru oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kullanıcının tüm tahliye başvurularını getir
exports.getUserEvacuationApplications = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      console.error('No user found in request:', req.user);
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('Getting evacuation applications for user:', req.user.userId);
    console.log('Executing database query for user ID:', req.user.userId);
    
    const result = await db.query(
      'SELECT * FROM evacuation_applications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    console.log('Database query executed successfully. Found applications:', result.rows.length);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting user evacuation applications:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching evacuation applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Belirli bir tahliye başvurusunu getir
exports.getEvacuationApplicationById = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM evacuation_applications WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Başvuru durumunu güncelle (admin için)
exports.updateEvacuationApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in_review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum'
      });
    }

    const result = await db.query(
      'UPDATE evacuation_applications SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [status, new Date(), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Başvuru durumu güncellendi',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 