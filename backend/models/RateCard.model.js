const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema for individual rate card items
const rateCardItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  item: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  uom: {
    type: String,
    enum: ['SFT', 'RFT', 'NOS'],
    default: 'SFT'
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    default: 0
  },
  material_options: {
    type: String,
    default: ''
  },
  material_prices: {
    type: String,
    default: ''
  },
  add_ons: {
    type: String,
    default: ''
  },
  addon_prices: {
    type: String,
    default: ''
  }
}, { _id: false });

// Main rate card schema
const rateCardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Rate card name is required'],
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  items: [rateCardItemSchema],
  isPasswordProtected: {
    type: Boolean,
    default: false
  },
  passwordHash: {
    type: String,
    select: false // Don't return password in queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  version: {
    type: String,
    default: "1.0"
  }
});

// Update timestamp on save
rateCardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to set password
rateCardSchema.methods.setPassword = async function(password) {
  if (!password) {
    this.isPasswordProtected = false;
    this.passwordHash = undefined;
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
  this.isPasswordProtected = true;
};

// Method to verify password
rateCardSchema.methods.verifyPassword = async function(password) {
  if (!this.isPasswordProtected) return true;
  if (!this.passwordHash) return false;
  
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('RateCard', rateCardSchema);