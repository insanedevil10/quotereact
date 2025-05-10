const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  website: {
    type: String
  },
  primaryColor: {
    type: String,
    default: '#C62828'
  },
  headerBgColor: {
    type: String,
    default: '#FFFFFF'
  },
  headerTextColor: {
    type: String,
    default: '#333333'
  },
  logoFull: {
    type: String // path to full logo image
  },
  logoCompact: {
    type: String // path to compact logo image
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', companySchema);