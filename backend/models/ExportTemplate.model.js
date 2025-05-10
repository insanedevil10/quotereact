const mongoose = require('mongoose');

const exportTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  include_logo: {
    type: Boolean,
    default: true
  },
  include_company_details: {
    type: Boolean,
    default: true
  },
  include_images: {
    type: Boolean,
    default: false
  },
  include_terms: {
    type: Boolean,
    default: true
  },
  terms_text: {
    type: String,
    default: "1. 50% advance payment before work begins.\n2. Balance payment on completion.\n3. Taxes as per government regulations.\n4. Delivery within 4-6 weeks from confirmation."
  },
  primary_color: {
    type: String,
    default: "#C62828"
  },
  header_text: {
    type: String,
    default: "Interior Design Quote"
  },
  footer_text: {
    type: String,
    default: "Thank you for choosing our services."
  },
  font_family: {
    type: String,
    default: "Arial"
  },
  font_size: {
    type: Number,
    default: 10
  },
  layout_type: {
    type: Number,
    enum: [1, 2, 3], // 1: Compact, 2: Detailed, 3: Visual
    default: 2
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
exportTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ExportTemplate', exportTemplateSchema);