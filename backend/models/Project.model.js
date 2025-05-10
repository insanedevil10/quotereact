const mongoose = require('mongoose');

// Sub-schema for project information
const projectInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  client_name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  site_address: {
    type: String,
    required: [true, 'Site address is required']
  },
  contact_info: {
    type: String
  },
  project_type: {
    type: String,
    enum: ['Apartment', 'Villa', 'Farmhouse', 'Independent House', 'Office Space', 'Other'],
    default: 'Apartment'
  }
}, { _id: false });

// Sub-schema for rooms
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    trim: true
  }
}, { _id: false });

// Sub-schema for material options
const materialSchema = new mongoose.Schema({
  options: {
    type: [String],
    default: []
  },
  selected: {
    type: String
  },
  base_material: {
    type: String
  },
  price_additions: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, { _id: false });

// Sub-schema for add-ons
const addOnSchema = new mongoose.Schema({
  selected: {
    type: Boolean,
    default: false
  },
  rate_per_unit: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  }
}, { _id: false });

// Sub-schema for line items
const lineItemSchema = new mongoose.Schema({
  room: {
    type: String,
    required: [true, 'Room name is required']
  },
  item: {
    type: String,
    required: [true, 'Item name is required']
  },
  uom: {
    type: String,
    enum: ['SFT', 'RFT', 'NOS'],
    default: 'SFT'
  },
  length: {
    type: Number,
    default: 0
  },
  height: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 1
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    default: 0
  },
  amount: {
    type: Number,
    default: 0
  },
  material: {
    type: materialSchema
  },
  add_ons: {
    type: Map,
    of: addOnSchema,
    default: new Map()
  }
});

// Main project schema
const projectSchema = new mongoose.Schema({
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
  project_info: {
    type: projectInfoSchema,
    required: true
  },
  rooms: [roomSchema],
  line_items: [lineItemSchema],
  settings: {
    gst: {
      type: Number,
      default: 18
    },
    discount: {
      type: Number,
      default: 0
    }
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
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);