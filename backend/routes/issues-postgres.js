const express = require('express');
const { getDatabase } = require('../database/postgres');
const { validateCreateIssue, validateUpdateIssue, validateTechUpdate } = require('../middleware/validation');

const router = express.Router();

// Get all issues with pagination
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const resolved = req.query.resolved;

    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    if (search) {
      whereClause = `WHERE (user_name ILIKE $${paramIndex} OR issue_description ILIKE $${paramIndex + 1} OR technician_name ILIKE $${paramIndex + 2})`;
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
      paramIndex += 3;
    }

    if (resolved !== undefined) {
      const resolvedValue = resolved === 'true';
      if (whereClause) {
        whereClause += ` AND is_resolved = $${paramIndex}`;
      } else {
        whereClause = `WHERE is_resolved = $${paramIndex}`;
      }
      params.push(resolvedValue);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM issues ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const dataQuery = `
      SELECT * FROM issues 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const result = await db.query(dataQuery, [...params, limit, offset]);

    const issues = result.rows.map(row => ({
      id: row.id,
      userName: row.user_name,
      issueDate: row.issue_date,
      issueDescription: row.issue_description,
      precedingEvents: row.preceding_events,
      resolutionSteps: row.resolution_steps,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      technicianName: row.technician_name,
      technicianNotes: row.technician_notes,
      isResolved: row.is_resolved
    }));

    res.json({
      issues,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ message: 'Error retrieving issues' });
  }
});

// Get specific issue
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const id = parseInt(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'Invalid issue ID' });
    }

    const result = await db.query('SELECT * FROM issues WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const row = result.rows[0];
    const issue = {
      id: row.id,
      userName: row.user_name,
      issueDate: row.issue_date,
      issueDescription: row.issue_description,
      precedingEvents: row.preceding_events,
      resolutionSteps: row.resolution_steps,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      technicianName: row.technician_name,
      technicianNotes: row.technician_notes,
      isResolved: row.is_resolved
    };

    res.json(issue);
  } catch (err) {
    console.error('Error fetching issue:', err);
    res.status(500).json({ message: 'Error retrieving issue' });
  }
});

// Create new issue
router.post('/', validateCreateIssue, async (req, res) => {
  try {
    const db = getDatabase();
    const { userName, issueDate, issueDescription, precedingEvents, resolutionSteps } = req.body;

    const query = `
      INSERT INTO issues (user_name, issue_date, issue_description, preceding_events, resolution_steps)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(query, [userName, issueDate, issueDescription, precedingEvents || null, resolutionSteps || null]);
    const row = result.rows[0];

    const issue = {
      id: row.id,
      userName: row.user_name,
      issueDate: row.issue_date,
      issueDescription: row.issue_description,
      precedingEvents: row.preceding_events,
      resolutionSteps: row.resolution_steps,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      technicianName: row.technician_name,
      technicianNotes: row.technician_notes,
      isResolved: row.is_resolved
    };

    res.status(201).json(issue);
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ message: 'Error creating issue' });
  }
});

// Update entire issue
router.put('/:id', validateUpdateIssue, async (req, res) => {
  try {
    const db = getDatabase();
    const id = parseInt(req.params.id);
    const { userName, issueDate, issueDescription, precedingEvents, resolutionSteps, technicianName, technicianNotes, isResolved } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Invalid issue ID' });
    }

    const query = `
      UPDATE issues 
      SET user_name = COALESCE($1, user_name),
          issue_date = COALESCE($2, issue_date),
          issue_description = COALESCE($3, issue_description),
          preceding_events = COALESCE($4, preceding_events),
          resolution_steps = COALESCE($5, resolution_steps),
          technician_name = COALESCE($6, technician_name),
          technician_notes = COALESCE($7, technician_notes),
          is_resolved = COALESCE($8, is_resolved),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;

    const result = await db.query(query, [userName, issueDate, issueDescription, precedingEvents, resolutionSteps, technicianName, technicianNotes, isResolved, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const row = result.rows[0];
    const issue = {
      id: row.id,
      userName: row.user_name,
      issueDate: row.issue_date,
      issueDescription: row.issue_description,
      precedingEvents: row.preceding_events,
      resolutionSteps: row.resolution_steps,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      technicianName: row.technician_name,
      technicianNotes: row.technician_notes,
      isResolved: row.is_resolved
    };

    res.json(issue);
  } catch (err) {
    console.error('Error updating issue:', err);
    res.status(500).json({ message: 'Error updating issue' });
  }
});

// Update only technician fields
router.patch('/:id/tech', validateTechUpdate, async (req, res) => {
  try {
    const db = getDatabase();
    const id = parseInt(req.params.id);
    const { technicianName, technicianNotes, isResolved } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Invalid issue ID' });
    }

    const query = `
      UPDATE issues 
      SET technician_name = $1,
          technician_notes = $2,
          is_resolved = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await db.query(query, [technicianName, technicianNotes, isResolved, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const row = result.rows[0];
    const issue = {
      id: row.id,
      userName: row.user_name,
      issueDate: row.issue_date,
      issueDescription: row.issue_description,
      precedingEvents: row.preceding_events,
      resolutionSteps: row.resolution_steps,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      technicianName: row.technician_name,
      technicianNotes: row.technician_notes,
      isResolved: row.is_resolved
    };

    res.json(issue);
  } catch (err) {
    console.error('Error updating technician fields:', err);
    res.status(500).json({ message: 'Error updating issue' });
  }
});

// Delete issue
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const id = parseInt(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'Invalid issue ID' });
    }

    const result = await db.query('DELETE FROM issues WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    res.status(500).json({ message: 'Error deleting issue' });
  }
});

module.exports = router;