const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all categories for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, user_id, name, icon, color, unit, default_amount, is_active, created_at, updated_at
       FROM categories 
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at ASC`,
      [req.userId]
    );

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get category by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, user_id, name, icon, color, unit, default_amount, is_active, created_at, updated_at
       FROM categories 
       WHERE id = $1 AND user_id = $2 AND is_active = true`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new category
router.post('/', [
  authenticateToken,
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('icon').isLength({ min: 1, max: 50 }).trim(),
  body('color').isLength({ min: 1, max: 20 }).trim(),
  body('unit').isLength({ min: 1, max: 20 }).trim(),
  body('default_amount').isFloat({ min: 0.01 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, icon, color, unit, default_amount } = req.body;

    // Check if category name already exists for this user
    const existing = await query(
      'SELECT id FROM categories WHERE user_id = $1 AND name = $2 AND is_active = true',
      [req.userId, name]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Create category
    const result = await query(
      `INSERT INTO categories (user_id, name, icon, color, unit, default_amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, name, icon, color, unit, default_amount, is_active, created_at, updated_at`,
      [req.userId, name, icon, color, unit, default_amount]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update category
router.put('/:id', [
  authenticateToken,
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('icon').optional().isLength({ min: 1, max: 50 }).trim(),
  body('color').optional().isLength({ min: 1, max: 20 }).trim(),
  body('unit').optional().isLength({ min: 1, max: 20 }).trim(),
  body('default_amount').optional().isFloat({ min: 0.01 }),
  body('is_active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, icon, color, unit, default_amount, is_active } = req.body;

    // Check if category exists and belongs to user
    const existing = await query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2 AND is_active = true',
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (icon !== undefined) {
      updates.push(`icon = $${paramCount}`);
      values.push(icon);
      paramCount++;
    }

    if (color !== undefined) {
      updates.push(`color = $${paramCount}`);
      values.push(color);
      paramCount++;
    }

    if (unit !== undefined) {
      updates.push(`unit = $${paramCount}`);
      values.push(unit);
      paramCount++;
    }

    if (default_amount !== undefined) {
      updates.push(`default_amount = $${paramCount}`);
      values.push(default_amount);
      paramCount++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, req.userId);

    const updateQuery = `
      UPDATE categories 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING id, user_id, name, icon, color, unit, default_amount, is_active, created_at, updated_at
    `;

    const result = await query(updateQuery, values);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete category (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1 AND user_id = $2 AND is_active = true',
      [id, req.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
