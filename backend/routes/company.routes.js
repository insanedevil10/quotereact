const express = require('express');
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company.model');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/company
 * @desc Get company details
 * @access Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route PUT /api/company
 * @desc Update company details
 * @access Private/Admin
 */
router.put('/', [
  protect,
  authorize('admin'),
  // Validation
  body('name').notEmpty().withMessage('Company name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Please include a valid email')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    // Update fields
    company.name = req.body.name;
    company.address = req.body.address;
    company.phone = req.body.phone;
    company.email = req.body.email;
    company.website = req.body.website || company.website;
    company.primaryColor = req.body.primaryColor || company.primaryColor;
    company.headerBgColor = req.body.headerBgColor || company.headerBgColor;
    company.headerTextColor = req.body.headerTextColor || company.headerTextColor;
    
    // Only update logo fields if they are provided
    if (req.body.logoFull) {
      company.logoFull = req.body.logoFull;
    }
    
    if (req.body.logoCompact) {
      company.logoCompact = req.body.logoCompact;
    }
    
    await company.save();
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route GET /api/company/theme
 * @desc Get company theme details (public)
 * @access Public
 */
router.get('/theme/:companyId', async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    // Return only theme-related fields
    res.status(200).json({
      success: true,
      data: {
        name: company.name,
        primaryColor: company.primaryColor,
        headerBgColor: company.headerBgColor,
        headerTextColor: company.headerTextColor,
        logoFull: company.logoFull,
        logoCompact: company.logoCompact
      }
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;