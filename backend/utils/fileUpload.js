const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const createUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage for logo uploads
const logoStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/logos');
    createUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create a unique filename with company ID and timestamp
    const uniqueSuffix = `${req.user.companyId}-${Date.now()}`;
    cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure storage for item images
const itemImageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/items');
    createUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create a unique filename with item ID and timestamp
    const uniqueSuffix = `${req.params.itemId || 'item'}-${Date.now()}`;
    cb(null, `item-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  
  // Reject other file types
  cb(new Error('Only image files are allowed!'), false);
};

// Create multer upload instances
const logoUpload = multer({
  storage: logoStorage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  },
  fileFilter: imageFileFilter
});

const itemImageUpload = multer({
  storage: itemImageStorage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  },
  fileFilter: imageFileFilter
});

module.exports = {
  logoUpload,
  itemImageUpload
};