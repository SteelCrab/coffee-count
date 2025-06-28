const express = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get counter data for a specific date (or today)
router.get('/', [
  authenticateToken,
  queryValidator('date').optional().isISO8601().toDate()
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

    const date = req.query.date || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT 
        c.id as category_id,
        c.name,
        c.icon,
        c.color,
        c.unit,
        COALESCE(cd.count, 0) as count,
        COALESCE(cd.amounts, '{}') as amounts
       FROM categories c
       LEFT JOIN counter_data cd ON c.id = cd.category_id AND cd.date = $1 AND cd.user_id = $2
       WHERE c.user_id = $2 AND c.is_active = true
       ORDER BY c.created_at ASC`,
      [date, req.userId]
    );

    const categories = {};
    
    for (const row of result.rows) {
      const amounts = Array.isArray(row.amounts) ? row.amounts : [];
      const totalAmount = amounts.reduce((sum, amount) => sum + parseFloat(amount || 0), 0);

      categories[row.name] = {
        category_id: row.category_id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        unit: row.unit,
        count: parseInt(row.count),
        amounts: amounts.map(a => parseFloat(a)),
        total_amount: totalAmount
      };
    }

    res.json({
      success: true,
      message: 'Counter data retrieved successfully',
      data: {
        date,
        categories
      }
    });

  } catch (error) {
    console.error('Get counter data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get counter data for a specific date
router.get('/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const result = await query(
      `SELECT 
        c.id as category_id,
        c.name,
        c.icon,
        c.color,
        c.unit,
        COALESCE(cd.count, 0) as count,
        COALESCE(cd.amounts, '{}') as amounts
       FROM categories c
       LEFT JOIN counter_data cd ON c.id = cd.category_id AND cd.date = $1 AND cd.user_id = $2
       WHERE c.user_id = $2 AND c.is_active = true
       ORDER BY c.created_at ASC`,
      [date, req.userId]
    );

    const categories = {};
    
    for (const row of result.rows) {
      const amounts = Array.isArray(row.amounts) ? row.amounts : [];
      const totalAmount = amounts.reduce((sum, amount) => sum + parseFloat(amount || 0), 0);

      categories[row.name] = {
        category_id: row.category_id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        unit: row.unit,
        count: parseInt(row.count),
        amounts: amounts.map(a => parseFloat(a)),
        total_amount: totalAmount
      };
    }

    res.json({
      success: true,
      message: 'Counter data retrieved successfully',
      data: {
        date,
        categories
      }
    });

  } catch (error) {
    console.error('Get counter data by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add counter data
router.post('/', [
  authenticateToken,
  body('category_id').isUUID(),
  body('amount').isFloat({ min: 0.01 }),
  body('notes').optional().isString().trim()
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

    const { category_id, amount, notes } = req.body;

    // Verify category belongs to user
    const categoryResult = await query(
      'SELECT name, icon, color, unit FROM categories WHERE id = $1 AND user_id = $2 AND is_active = true',
      [category_id, req.userId]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const category = categoryResult.rows[0];
    const today = new Date().toISOString().split('T')[0];

    // Insert or update counter data
    const result = await query(
      `INSERT INTO counter_data (user_id, category_id, date, count, amounts, notes)
       VALUES ($1, $2, $3, 1, ARRAY[$4], $5)
       ON CONFLICT (user_id, category_id, date)
       DO UPDATE SET 
         count = counter_data.count + 1,
         amounts = array_append(counter_data.amounts, $4),
         notes = CASE 
           WHEN $5 IS NOT NULL THEN 
             CASE 
               WHEN counter_data.notes IS NULL THEN $5
               ELSE counter_data.notes || E'\\n' || $5
             END
           ELSE counter_data.notes
         END,
         updated_at = NOW()
       RETURNING count, amounts`,
      [req.userId, category_id, today, amount, notes]
    );

    const counterData = result.rows[0];
    const amounts = Array.isArray(counterData.amounts) ? counterData.amounts : [];
    const totalAmount = amounts.reduce((sum, amt) => sum + parseFloat(amt || 0), 0);

    res.status(201).json({
      success: true,
      message: 'Counter data added successfully',
      data: {
        category_id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        unit: category.unit,
        count: parseInt(counterData.count),
        amounts: amounts.map(a => parseFloat(a)),
        total_amount: totalAmount
      }
    });

  } catch (error) {
    console.error('Add counter data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get counter data for a date range
router.get('/range', [
  authenticateToken,
  queryValidator('start_date').isISO8601().toDate(),
  queryValidator('end_date').isISO8601().toDate()
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

    const { start_date, end_date } = req.query;

    const result = await query(
      `SELECT 
        cd.date,
        c.id as category_id,
        c.name,
        c.icon,
        c.color,
        c.unit,
        cd.count,
        cd.amounts
       FROM counter_data cd
       JOIN categories c ON c.id = cd.category_id
       WHERE cd.user_id = $1 AND cd.date BETWEEN $2 AND $3 AND c.is_active = true
       ORDER BY cd.date ASC, c.created_at ASC`,
      [req.userId, start_date, end_date]
    );

    const responseMap = {};

    for (const row of result.rows) {
      const dateStr = row.date.toISOString().split('T')[0];
      const amounts = Array.isArray(row.amounts) ? row.amounts : [];
      const totalAmount = amounts.reduce((sum, amount) => sum + parseFloat(amount || 0), 0);

      if (!responseMap[dateStr]) {
        responseMap[dateStr] = {};
      }

      responseMap[dateStr][row.name] = {
        category_id: row.category_id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        unit: row.unit,
        count: parseInt(row.count),
        amounts: amounts.map(a => parseFloat(a)),
        total_amount: totalAmount
      };
    }

    const responses = Object.entries(responseMap)
      .map(([date, categories]) => ({ date, categories }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      message: 'Counter range data retrieved successfully',
      data: responses
    });

  } catch (error) {
    console.error('Get counter range error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
