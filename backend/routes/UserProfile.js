// AI-Generated API Endpoint Template
// Generated for: UserProfile
// Template: default
// Date: 2025-08-28

const express = require('express');
const router = express.Router();

// Middleware
const { checkAdminAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// Data models (replace with actual models)
// const UserProfileModel = require('../models/UserProfile');

/**
 * @route   GET /api/{{endpointName.toLowerCase()}}
 * @desc    Get all UserProfile items
 * @access  Public (or Private based on requirements)
 */
router.get('/', async (req, res) => {
  try {
    // Auto-generated logic
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Replace with actual database query
    // const items = await UserProfileModel.find({
    //   $or: [
    //     { name: { $regex: search, $options: 'i' } },
    //     { description: { $regex: search, $options: 'i' } }
    //   ]
    // })
    // .limit(limit * 1)
    // .skip((page - 1) * limit)
    // .exec();

    // Mock data for template
    const items = [
      {
        id: 1,
        name: 'Sample UserProfile',
        description: 'Auto-generated sample data',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const total = items.length; // Replace with actual count

    res.json({
      success: true,
      data: items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching UserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/{{endpointName.toLowerCase()}}/:id
 * @desc    Get single UserProfile by ID
 * @access  Public (or Private based on requirements)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Replace with actual database query
    // const item = await UserProfileModel.findById(id);
    
    // Mock data for template
    const item = {
      id: parseInt(id),
      name: 'Sample UserProfile ' + id,
      description: 'Auto-generated sample data',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'UserProfile not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching UserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/{{endpointName.toLowerCase()}}
 * @desc    Create new UserProfile
 * @access  Private (Admin only)
 */
router.post('/', checkAdminAuth, validateRequest, async (req, res) => {
  try {
    const { name, description, ...otherFields } = req.body;
    
    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    // Replace with actual database creation
    // const newItem = new UserProfileModel({
    //   name,
    //   description,
    //   ...otherFields
    // });
    // await newItem.save();

    // Mock response for template
    const newItem = {
      id: Date.now(),
      name,
      description,
      ...otherFields,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'UserProfile created successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Error creating UserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/{{endpointName.toLowerCase()}}/:id
 * @desc    Update UserProfile
 * @access  Private (Admin only)
 */
router.put('/:id', checkAdminAuth, validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Replace with actual database update
    // const updatedItem = await UserProfileModel.findByIdAndUpdate(
    //   id,
    //   { ...updateData, updatedAt: new Date() },
    //   { new: true, runValidators: true }
    // );

    // Mock response for template
    const updatedItem = {
      id: parseInt(id),
      ...updateData,
      updatedAt: new Date()
    };

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'UserProfile not found'
      });
    }

    res.json({
      success: true,
      message: 'UserProfile updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating UserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/{{endpointName.toLowerCase()}}/:id
 * @desc    Delete UserProfile
 * @access  Private (Admin only)
 */
router.delete('/:id', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Replace with actual database deletion
    // const deletedItem = await UserProfileModel.findByIdAndDelete(id);
    
    // Mock response for template
    const deletedItem = {
      id: parseInt(id),
      name: 'Deleted UserProfile',
      deletedAt: new Date()
    };

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'UserProfile not found'
      });
    }

    res.json({
      success: true,
      message: 'UserProfile deleted successfully',
      data: deletedItem
    });
  } catch (error) {
    console.error('Error deleting UserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
