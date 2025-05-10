const express = require('express');
const { body, validationResult } = require('express-validator');
const RateCard = require('../models/RateCard.model');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/rate-card
 * @desc Get all rate cards for the company
 * @access Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const rateCards = await RateCard.find({ companyId: req.user.companyId })
      .select('name isPasswordProtected createdAt updatedAt');
    
    res.status(200).json({
      success: true,
      count: rateCards.length,
      data: rateCards
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
 * @route GET /api/rate-card/:id
 * @desc Get a rate card by ID
 * @access Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const rateCard = await RateCard.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    
    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: 'Rate card not found'
      });
    }
    
    // Check if rate card is password protected
    if (rateCard.isPasswordProtected) {
      const password = req.headers['x-rate-card-password'];
      
      if (!password) {
        return res.status(401).json({
          success: false,
          message: 'Password required to access this rate card',
          requiresPassword: true
        });
      }
      
      const isPasswordValid = await rateCard.verifyPassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password',
          requiresPassword: true
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: rateCard
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Rate card not found'
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
 * @route POST /api/rate-card
 * @desc Create a new rate card
 * @access Private
 */
router.post('/', [
  protect,
  // Validation
  body('name').notEmpty().withMessage('Rate card name is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    // Create new rate card with company ID
    const rateCardData = {
      name: req.body.name,
      companyId: req.user.companyId,
      items: req.body.items || []
    };
    
    const rateCard = await RateCard.create(rateCardData);
    
    // Set password if provided
    if (req.body.password) {
      await rateCard.setPassword(req.body.password);
      await rateCard.save();
    }
    
    res.status(201).json({
      success: true,
      data: rateCard
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
 * @route PUT /api/rate-card/:id
 * @desc Update a rate card
 * @access Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    let rateCard = await RateCard.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    
    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: 'Rate card not found'
      });
    }
    
    // Check if rate card is password protected
    if (rateCard.isPasswordProtected) {
      const password = req.headers['x-rate-card-password'];
      
      if (!password) {
        return res.status(401).json({
          success: false,
          message: 'Password required to modify this rate card',
          requiresPassword: true
        });
      }
      
      const isPasswordValid = await rateCard.verifyPassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password',
          requiresPassword: true
        });
      }
    }
    
    // Update rate card data
    rateCard.name = req.body.name || rateCard.name;
    
    if (req.body.items) {
      rateCard.items = req.body.items;
    }
    
    // Handle password changes
    if (req.body.hasOwnProperty('password')) {
      await rateCard.setPassword(req.body.password);
    }
    
    rateCard.updatedAt = Date.now();
    await rateCard.save();
    
    res.status(200).json({
      success: true,
      data: rateCard
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Rate card not found'
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
 * @route DELETE /api/rate-card/:id
 * @desc Delete a rate card
 * @access Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const rateCard = await RateCard.findOne({ 
      _id: req.params.id,
      companyId: req.user.companyId 
    });
    
    if (!rateCard) {
      return res.status(404).json({
        success: false,
        message: 'Rate card not found'
      });
    }
    
    // Check if rate card is password protected
    if (rateCard.isPasswordProtected) {
      const password = req.headers['x-rate-card-password'];
      
      if (!password) {
        return res.status(401).json({
          success: false,
          message: 'Password required to delete this rate card',
          requiresPassword: true
        });
      }
      
      const isPasswordValid = await rateCard.verifyPassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password',
          requiresPassword: true
        });
      }
    }
    
    await rateCard.remove();
    
    res.status(200).json({
      success: true,
      message: 'Rate card deleted successfully'
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Rate card not found'
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