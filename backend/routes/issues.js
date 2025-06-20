const express = require('express');
const { getDatabase } = require('../database/db');
const { validateCreateIssue, validateUpdateIssue, validateTechUpdate } = require('../middleware/validation');

const router = express.Router();

// Get all issues with pagination
router.get('/', (req, res) => {
  const db = getDatabase();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const resolved = req.query.resolved;

  let whereClause = '';
  let params = [];

  if (search) {
    whereClause = 'WHERE (user_name LIKE ? OR issue_description LIKE ? OR technician_name LIKE ?)';
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }

  if (resolved !== undefined) {
    const resolvedValue = resolved === 'true' ? 1 : 0;
    if (whereClause) {
      whereClause += ' AND is_resolved = ?';
    } else {
      whereClause = 'WHERE is_resolved = ?';
    }
    params.push(resolvedValue);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM issues ${whereClause}`;
  
  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      console.error('Error counting issues:', err);
      return res.status(500).json({ message: 'Error retrieving issues' });
    }

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const dataQuery = `
      SELECT * FROM issues 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    db.all(dataQuery, [...params, limit, offset], (err, rows) => {
      if (err) {
        console.error('Error fetching issues:', err);
        return res.status(500).json({ message: 'Error retrieving issues' });
      }

      const issues = rows.map(row => ({
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
        isResolved: Boolean(row.is_resolved)
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
    });
  });
});

// Get specific issue
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const id = parseInt(req.params.id);

  if (!id) {
    return res.status(400).json({ message: 'Invalid issue ID' });
  }

  db.get('SELECT * FROM issues WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching issue:', err);
      return res.status(500).json({ message: 'Error retrieving issue' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Issue not found' });
    }

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
      isResolved: Boolean(row.is_resolved)
    };

    res.json(issue);
  });
});

// Create new issue
router.post('/', validateCreateIssue, (req, res) => {
  const db = getDatabase();
  const { userName, issueDate, issueDescription, precedingEvents, resolutionSteps } = req.body;

  const query = `
    INSERT INTO issues (user_name, issue_date, issue_description, preceding_events, resolution_steps)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [userName, issueDate, issueDescription, precedingEvents || null, resolutionSteps || null], function(err) {
    if (err) {
      console.error('Error creating issue:', err);
      return res.status(500).json({ message: 'Error creating issue' });
    }

    // Return the created issue
    db.get('SELECT * FROM issues WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created issue:', err);
        return res.status(500).json({ message: 'Issue created but error retrieving it' });
      }

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
        isResolved: Boolean(row.is_resolved)
      };

      res.status(201).json(issue);
    });
  });
});

// Update entire issue
router.put('/:id', validateUpdateIssue, (req, res) => {
  const db = getDatabase();
  const id = parseInt(req.params.id);
  const { userName, issueDate, issueDescription, precedingEvents, resolutionSteps, technicianName, technicianNotes, isResolved } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Invalid issue ID' });
  }

  const query = `
    UPDATE issues 
    SET user_name = COALESCE(?, user_name),
        issue_date = COALESCE(?, issue_date),
        issue_description = COALESCE(?, issue_description),
        preceding_events = COALESCE(?, preceding_events),
        resolution_steps = COALESCE(?, resolution_steps),
        technician_name = COALESCE(?, technician_name),
        technician_notes = COALESCE(?, technician_notes),
        is_resolved = COALESCE(?, is_resolved),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [userName, issueDate, issueDescription, precedingEvents, resolutionSteps, technicianName, technicianNotes, isResolved, id], function(err) {
    if (err) {
      console.error('Error updating issue:', err);
      return res.status(500).json({ message: 'Error updating issue' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Return updated issue
    db.get('SELECT * FROM issues WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated issue:', err);
        return res.status(500).json({ message: 'Issue updated but error retrieving it' });
      }

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
        isResolved: Boolean(row.is_resolved)
      };

      res.json(issue);
    });
  });
});

// Update only technician fields
router.patch('/:id/tech', validateTechUpdate, (req, res) => {
  const db = getDatabase();
  const id = parseInt(req.params.id);
  const { technicianName, technicianNotes, isResolved } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Invalid issue ID' });
  }

  const query = `
    UPDATE issues 
    SET technician_name = ?,
        technician_notes = ?,
        is_resolved = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [technicianName, technicianNotes, isResolved, id], function(err) {
    if (err) {
      console.error('Error updating technician fields:', err);
      return res.status(500).json({ message: 'Error updating issue' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Return updated issue
    db.get('SELECT * FROM issues WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated issue:', err);
        return res.status(500).json({ message: 'Issue updated but error retrieving it' });
      }

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
        isResolved: Boolean(row.is_resolved)
      };

      res.json(issue);
    });
  });
});

// Delete issue
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const id = parseInt(req.params.id);

  if (!id) {
    return res.status(400).json({ message: 'Invalid issue ID' });
  }

  db.run('DELETE FROM issues WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting issue:', err);
      return res.status(500).json({ message: 'Error deleting issue' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({ message: 'Issue deleted successfully' });
  });
});

module.exports = router;