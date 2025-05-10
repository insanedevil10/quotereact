const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project.model');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/projects
 * @desc Get all projects for the current user's company
 * @access Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ companyId: req.user.companyId })
      .select('project_info createdAt updatedAt');
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
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
 * @route GET /api/projects/:id
 * @desc Get a single project by ID
 * @access Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error(err);
    // Check if the error is a Mongoose CastError (invalid ID)
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
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
 * @route POST /api/projects
 * @desc Create a new project
 * @access Private
 */
router.post('/', [
  protect,
  // Validation
  body('project_info.name').notEmpty().withMessage('Project name is required'),
  body('project_info.client_name').notEmpty().withMessage('Client name is required'),
  body('project_info.site_address').notEmpty().withMessage('Site address is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    // Add user ID and company ID to project data
    const projectData = {
      ...req.body,
      userId: req.user._id,
      companyId: req.user.companyId
    };
    
    // Create project
    const project = await Project.create(projectData);
    
    res.status(201).json({
      success: true,
      data: project
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
 * @route PUT /api/projects/:id
 * @desc Update a project
 * @access Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    let project = await Project.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Update project
    project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error(err);
    // Check if the error is a Mongoose CastError (invalid ID)
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
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
 * @route DELETE /api/projects/:id
 * @desc Delete a project
 * @access Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await project.remove();
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (err) {
    console.error(err);
    // Check if the error is a Mongoose CastError (invalid ID)
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
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