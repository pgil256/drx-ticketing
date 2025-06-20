import React, { useState } from 'react';
import { formatDate, formatDateTime } from '../utils/dateHelpers';
import './IssueCard.css';

const IssueCard = ({ issue, onTechnicianUpdate }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleTechnicianClick = () => {
    onTechnicianUpdate(issue);
  };


  return (
    <div className={`issue-card ${issue.isResolved ? 'resolved' : 'open'}`}>
      <div className="issue-header">
        <div className="issue-meta">
          <span className="issue-id">#{issue.id}</span>
          <span className={`badge ${issue.isResolved ? 'badge-resolved' : 'badge-open'}`}>
            {issue.isResolved ? 'Resolved' : 'Open'}
          </span>
          <span className="issue-date">{formatDate(issue.issueDate)}</span>
        </div>
        <div className="issue-actions">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn btn-secondary btn-sm"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          <button
            onClick={handleTechnicianClick}
            className="btn btn-primary btn-sm"
          >
            {issue.technicianName ? 'Update Notes' : 'Add Notes'}
          </button>
        </div>
      </div>

      <div className="issue-body">
        <div className="user-info">
          <h3>Reported by: {issue.userName}</h3>
          <p className="created-date">
            Submitted: {formatDateTime(issue.createdAt)}
          </p>
        </div>

        <div className="issue-description">
          <h4>Issue Description</h4>
          <p>
            {showFullDescription ? 
              issue.issueDescription : 
              truncateText(issue.issueDescription)
            }
            {issue.issueDescription && issue.issueDescription.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="toggle-text-btn"
              >
                {showFullDescription ? ' Show Less' : ' Show More'}
              </button>
            )}
          </p>
        </div>

        {showDetails && (
          <div className="issue-details">
            {issue.precedingEvents && (
              <div className="detail-section">
                <h4>Preceding Events</h4>
                <p>{issue.precedingEvents}</p>
              </div>
            )}

            {issue.resolutionSteps && (
              <div className="detail-section">
                <h4>Steps Already Tried</h4>
                <p>{issue.resolutionSteps}</p>
              </div>
            )}
          </div>
        )}

        {issue.technicianName && (
          <div className="technician-info">
            <h4>Technician Response</h4>
            <div className="tech-details">
              <p><strong>Technician:</strong> {issue.technicianName}</p>
              <p><strong>Last Updated:</strong> {formatDateTime(issue.updatedAt)}</p>
              {issue.technicianNotes && (
                <div className="tech-notes">
                  <strong>Notes:</strong>
                  <p>{issue.technicianNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;