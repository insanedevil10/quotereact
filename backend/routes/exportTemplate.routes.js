const express = require('express');
const { body, validationResult } = require('express-validator');
const ExportTemplate = require('../models/ExportTemplate.model');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/export-templates
 * @desc Get all export templates for the company
 * @access Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const templates = await ExportTemplate.find({ 
      companyId: req.user.companyId 
    });
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
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
 * @route GET /api/export-templates/:id
 * @desc Get a single export template
 * @access Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const template = await ExportTemplate.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route POST /api/export-templates
 * @desc Create a new export template
 * @access Private
 */
router.post('/', [
  protect,
  // Validation
  body('name').notEmpty().withMessage('Template name is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    // Create template with current user and company
    const templateData = {
      ...req.body,
      userId: req.user._id,
      companyId: req.user.companyId
    };
    
    const template = await ExportTemplate.create(templateData);
    
    res.status(201).json({
      success: true,
      data: template
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
 * @route PUT /api/export-templates/:id
 * @desc Update an export template
 * @access Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    let template = await ExportTemplate.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    // Check if user has permission to update
    if (template.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this template'
      });
    }
    
    // Update template
    template = await ExportTemplate.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

/**
 * @route DELETE /api/export-templates/:id
 * @desc Delete an export template
 * @access Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const template = await ExportTemplate.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    // Check if user has permission to delete
    if (template.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this template'
      });
    }
    
    await template.remove();
    
    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
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