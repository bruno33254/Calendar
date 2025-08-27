const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection test on startup
testConnection();

// API Routes

// GET all calendar data
app.get('/api/calendar', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM assessement ORDER BY submit_date ASC');
    
    res.json({
      success: true,
      data: rows,
      message: 'Calendar data retrieved successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving calendar data',
      error: error.message
    });
  }
});

// GET calendar data by date
app.get('/api/calendar/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM assessement WHERE DATE(submit_date) = ? ORDER BY submit_date ASC',
      [date]
    );
    
    res.json({
      success: true,
      data: rows,
      message: `Calendar data for ${date} retrieved successfully`
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving calendar data for date',
      error: error.message
    });
  }
});

// POST new calendar item
app.post('/api/calendar', async (req, res) => {
  try {
    const { name, description, submit_date, color } = req.body;
    
    // Validate required fields
    if (!name || !submit_date) {
      return res.status(400).json({
        success: false,
        message: 'Name and submit_date are required'
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO assessement (name, description, submit_date, color) VALUES (?, ?, ?, ?)',
      [name, description || '', submit_date, color || '#FF6B6B']
    );
    
    const newItem = {
      ID: result.insertId,
      name,
      description: description || '',
      submit_date,
      color: color || '#FF6B6B'
    };
    
    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Assessment created successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assessment',
      error: error.message
    });
  }
});

// PUT update calendar item
app.put('/api/calendar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, submit_date, color } = req.body;
    
    // Check if item exists
    const [existingRows] = await pool.execute(
      'SELECT * FROM assessement WHERE ID = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    // Update the item
    await pool.execute(
      'UPDATE assessement SET name = ?, description = ?, submit_date = ?, color = ? WHERE ID = ?',
      [name, description, submit_date, color, id]
    );
    
    const updatedItem = {
      ID: parseInt(id),
      name,
      description,
      submit_date,
      color
    };
    
    res.json({
      success: true,
      data: updatedItem,
      message: 'Assessment updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assessment',
      error: error.message
    });
  }
});

// DELETE calendar item
app.delete('/api/calendar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item exists
    const [existingRows] = await pool.execute(
      'SELECT * FROM assessement WHERE ID = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    // Delete the item
    await pool.execute(
      'DELETE FROM assessement WHERE ID = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: existingRows[0],
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assessment',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Calendar API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Calendar API Server',
    version: '1.0.0',
    endpoints: {
      'GET /api/calendar': 'Get all assessments',
      'GET /api/calendar/:date': 'Get assessments by date',
      'POST /api/calendar': 'Create new assessment',
      'PUT /api/calendar/:id': 'Update assessment',
      'DELETE /api/calendar/:id': 'Delete assessment',
      'GET /api/health': 'Health check'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Calendar API Server running on port ${PORT}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app; 