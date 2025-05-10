const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.Model');
const Company = require('../models/Company.model');
const { generateToken } = require('../utils/jwtUtils');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user and company
 * @access Public
 */
router.post('/register', [
  // Validation
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('companyAddress').notEmpty().withMessage('Company address is required'),
  body('companyPhone').notEmpty().withMessage('Company phone is required'),
  body('companyEmail').isEmail().withMessage('Please include a valid company email')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create new company
    const company = await Company.create({
      name: req.body.companyName,
      address: req.body.companyAddress,
      phone: req.body.companyPhone,
      email: req.body.companyEmail,
      website: req.body.companyWebsite || '',
      primaryColor: req.body.primaryColor || '#C62828',
      headerBgColor: req.body.headerBgColor || '#FFFFFF',
      headerTextColor: req.body.headerTextColor || '#333333'
    });
    
    // Create new user with company ID
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: 'admin', // First user is admin
      companyId: company._id
    });
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      company: {
        id: company._id,
        name: company.name
      }
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
 * @route POST /api/auth/login
 * @desc Login user and return token
 * @access Public
 */
router.post('/login', [
  // Validation
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    // Find user by email with password
    const user = await User.findOne({ email: req.body.email }).select('+password');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(req.body.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Get company information
    const company = await Company.findById(user.companyId);
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      company: company ? {
        id: company._id,
        name: company.name,
        primaryColor: company.primaryColor,
        headerBgColor: company.headerBgColor,
        headerTextColor: company.headerTextColor
      } : null
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
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const company = await Company.findById(user.companyId);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      company: company ? {
        id: company._id,
        name: company.name,
        primaryColor: company.primaryColor,
        headerBgColor: company.headerBgColor,
        headerTextColor: company.headerTextColor
      } : null
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
 * @route POST /api/auth/add-user
 * @desc Add a new user to company (admin only)
 * @access Private/Admin
 */
router.post('/add-user', [
  protect,
  authorize('admin'),
  // Validation
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['user', 'admin']).withMessage('Role must be either user or admin')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create new user with current user's company ID
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      companyId: req.user.companyId
    });
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
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
 * @route GET /api/auth/users
 * @desc Get all users in company (admin only)
 * @access Private/Admin
 */
router.get('/users', [protect, authorize('admin')], async (req, res) => {
  try {
    const users = await User.find({ companyId: req.user.companyId });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }))
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
 * @route PUT /api/auth/update-password
 * @desc Update user password
 * @access Private
 */
router.put('/update-password', [
  protect,
  // Validation
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if current password matches
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = req.body.newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
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

module.exports = router;