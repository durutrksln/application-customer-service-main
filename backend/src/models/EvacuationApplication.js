const mongoose = require('mongoose');

const evacuationApplicationSchema = new mongoose.Schema({
  // Müşteri Bilgileri
  customerName: {
    type: String,
    required: true
  },
  tckn: {
    type: String,
    required: true
  },
  phoneNumber: String,
  email: String,

  // Tesisat Bilgileri
  installationNumber: {
    type: String,
    required: true
  },
  installationType: {
    type: String,
    enum: ['tekil_kod', 'meter_barcode', 'old_bill'],
    default: 'tekil_kod'
  },
  oldBillFile: {
    type: String // Dosya yolu
  },

  // Mülk Bilgileri
  propertyType: {
    type: String,
    enum: ['owner', 'tenant'],
    required: true
  },
  propertyOwnerName: String,
  propertyOwnerId: String,
  propertyAddress: String,

  // Vekalet Bilgileri
  isProxy: {
    type: Boolean,
    default: false
  },
  proxyDocument: {
    type: String // Dosya yolu
  },

  // DASK Bilgileri
  daskPolicyNumber: {
    type: String,
    required: true
  },

  iban: {
    type: String,
    required: true
  },

  nufusCuzdaniPath: String,
  mulkiyetBelgesiPath: String,

  // Başvuru Durumu
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Zaman Bilgileri
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Güncelleme zamanını otomatik güncelle
evacuationApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EvacuationApplication', evacuationApplicationSchema); 