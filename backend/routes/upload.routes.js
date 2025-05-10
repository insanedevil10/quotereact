const express = require('express');
const path = require('path');
const fs = require('fs');
const Company = require('../models/Company.model');
const { protect, authorize } = require('../middleware/auth.middleware');
const { logoUpload, itemImageUpload } = require('../utils/fileUpload');

const router = express.Router();

/**
 * @route POST /api/upload/logo/:type
 * @desc Upload company logo (full or compact)
 * @access Private/Admin
 */
router.post('/logo/:type', [
  protect,
  authorize('admin'),
  logoUpload.single('logo')
], async (req, res) => {
  try {
    // Check if valid logo type
    const logoType = req.params.type;
    if (logoType !== 'full' && logoType !== 'compact') {
      return res.status(400).json({
        success: false,
        message: 'Invalid logo type. Use "full" or "compact"'
      });
    }
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Get file path
    const filePath = `/uploads/logos/${req.file.filename}`;
    
    // Update company record with new logo path
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      // Delete the uploaded file if company not found
      fs.unlinkSync(path.join(__dirname, '..', filePath));
      
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    // Delete old logo file if it exists
    const oldLogoField = logoType === 'full' ? 'logoFull' : 'logoCompact';
    if (company[oldLogoField]) {
      const oldPath = path.join(__dirname, '..', company[oldLogoField]);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    // Update company record
    if (logoType === 'full') {
      company.logoFull = filePath;
    } else {
      company.logoCompact = filePath;
    }
    
    await company.save();
    
    // Return success with file path
    res.status(200).json({
      success: true,
      data: {
        filePath
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: err.message
    });
  }
});

/**
 * @route POST /api/upload/item-image/:itemId
 * @desc Upload image for an item
 * @access Private
 */
router.post('/item-image/:itemId?', [
  protect,
  itemImageUpload.single('image')
], async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Get file path
    const filePath = `/uploads/items/${req.file.filename}`;
    
    // Return success with file path
    res.status(200).json({
      success: true,
      data: {
        filePath
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: err.message
    });
  }
});

/**
 * @route DELETE /api/upload/image
 * @desc Delete an uploaded image
 * @access Private
 */
router.delete('/image', protect, async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'No file path provided'
      });
    }
    
    // Ensure path is within uploads directory and not trying to access other files
    if (!filePath.startsWith('/uploads/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file path'
      });
    }
    
    // Check if file exists
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Delete file
    fs.unlinkSync(fullPath);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: err.message
    });
  }
});

module.exports = router;