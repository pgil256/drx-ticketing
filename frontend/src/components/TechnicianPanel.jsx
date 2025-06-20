import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { validateTechnicianForm } from '../utils/validation';
import { formatDate } from '../utils/dateHelpers';
import './TechnicianPanel.css';

const TechnicianPanel = ({ issue, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      technicianName: issue.technicianName || '',
      technicianNotes: issue.technicianNotes || '',
      isResolved: issue.isResolved || false
    }
  });

  const handleSaveNotes = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Validate notes are provided
      if (!data.technicianName || !data.technicianNotes) {
        setSubmitError('Please enter your name and notes');
        setIsSubmitting(false);
        return;
      }

      // Save notes without changing resolution status
      const submitData = {
        ...data,
        isResolved: issue.isResolved // Keep current status
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error saving notes:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setSubmitError(error.response.data.message);
      } else if (error.response && error.response.data && error.response.data.details) {
        setSubmitError(error.response.data.details.join(', '));
      } else {
        setSubmitError('Failed to save notes. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveIssue = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Validate notes are provided
      if (!data.technicianName || !data.technicianNotes) {
        setSubmitError('Please enter your name and notes before resolving');
        setIsSubmitting(false);
        return;
      }

      // Resolve the issue
      const submitData = {
        ...data,
        isResolved: true
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error resolving issue:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setSubmitError(error.response.data.message);
      } else if (error.response && error.response.data && error.response.data.details) {
        setSubmitError(error.response.data.details.join(', '));
      } else {
        setSubmitError('Failed to resolve issue. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="technician-panel-overlay">
      <div className="technician-panel">
        <div className="panel-header">
          <h2>{issue.technicianName ? 'Update Notes' : 'Add Technical Notes'}</h2>
          <button onClick={onCancel} className="close-btn">
            ×
          </button>
        </div>

        <div className="issue-summary">
          <h3>Issue #{issue.id}</h3>
          <p><strong>Reported by:</strong> {issue.userName}</p>
          <p><strong>Date:</strong> {formatDate(issue.issueDate)}</p>
          <div className="issue-description-preview">
            <p><strong>Description:</strong></p>
            <p>{issue.issueDescription}</p>
          </div>
        </div>

        {submitError && (
          <div className="alert alert-error animate-fade-in">
            {submitError}
          </div>
        )}

        <div className="technician-form">
          <div className="form-group required">
            <label htmlFor="technicianName">Your Name</label>
            <input
              type="text"
              id="technicianName"
              className="form-input"
              {...register('technicianName', {
                required: 'Your name is required',
                maxLength: { value: 100, message: 'Name must be less than 100 characters' }
              })}
              placeholder="Enter your name"
            />
            {errors.technicianName && (
              <div className="error-message">{errors.technicianName.message}</div>
            )}
          </div>

          <div className="form-group required">
            <label htmlFor="technicianNotes">Technical Notes & Documentation</label>
            <textarea
              id="technicianNotes"
              rows="6"
              className="form-textarea"
              {...register('technicianNotes', {
                required: 'Technical notes are required',
                maxLength: { value: 5000, message: 'Notes must be less than 5000 characters' }
              })}
              placeholder="Document your findings, diagnosis, solution, steps taken, root cause analysis, and any future recommendations..."
            />
            {errors.technicianNotes && (
              <div className="error-message">{errors.technicianNotes.message}</div>
            )}
          </div>

          <div className="current-status">
            <p><strong>Current Status:</strong> {issue.isResolved ? 'Resolved' : 'Open'}</p>
          </div>

          <div className="form-actions">
            <button
              onClick={handleSubmit(handleSaveNotes)}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Saving...
                </>
              ) : (
                'Save Notes'
              )}
            </button>
            
            {!issue.isResolved && (
              <button
                onClick={handleSubmit(handleResolveIssue)}
                disabled={isSubmitting}
                className="btn btn-success"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Resolving...
                  </>
                ) : (
                  'Resolve Issue'
                )}
              </button>
            )}
            
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianPanel;