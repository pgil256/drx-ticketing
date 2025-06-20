import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { issueAPI } from '../services/api';
import { validateIssueForm } from '../utils/validation';
import { getTodayForInput } from '../utils/dateHelpers';
import useLocalStorage from '../hooks/useLocalStorage';
import './IssueForm.css';

const IssueForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [draftData, setDraftData, removeDraftData] = useLocalStorage('issue-form-draft', {});

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      userName: draftData.userName || '',
      issueDate: draftData.issueDate || getTodayForInput(),
      issueDescription: draftData.issueDescription || '',
      precedingEvents: draftData.precedingEvents || '',
      resolutionSteps: draftData.resolutionSteps || ''
    }
  });

  const watchedValues = watch();

  // Auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchedValues.userName || watchedValues.issueDescription || 
          watchedValues.precedingEvents || watchedValues.resolutionSteps) {
        setDraftData(watchedValues);
      }
    }, 1000); // Save draft after 1 second of inactivity

    return () => clearTimeout(timer);
  }, [watchedValues, setDraftData]);

  // Load draft data on component mount
  useEffect(() => {
    if (draftData.userName) setValue('userName', draftData.userName);
    if (draftData.issueDate) setValue('issueDate', draftData.issueDate);
    if (draftData.issueDescription) setValue('issueDescription', draftData.issueDescription);
    if (draftData.precedingEvents) setValue('precedingEvents', draftData.precedingEvents);
    if (draftData.resolutionSteps) setValue('resolutionSteps', draftData.resolutionSteps);
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      // Client-side validation
      const validation = validateIssueForm(data);
      if (!validation.isValid) {
        setSubmitError('Please check the form for errors');
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      const response = await issueAPI.createIssue(data);
      
      setSubmitMessage(`Issue submitted successfully! Issue ID: ${response.id}`);
      reset({
        userName: '',
        issueDate: getTodayForInput(),
        issueDescription: '',
        precedingEvents: '',
        resolutionSteps: ''
      });
      removeDraftData(); // Clear saved draft

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitMessage('');
      }, 5000);

    } catch (error) {
      console.error('Error submitting issue:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setSubmitError(error.response.data.message);
      } else if (error.response && error.response.data && error.response.data.details) {
        setSubmitError(error.response.data.details.join(', '));
      } else {
        setSubmitError('Failed to submit issue. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearDraft = () => {
    reset({
      userName: '',
      issueDate: getTodayForInput(),
      issueDescription: '',
      precedingEvents: '',
      resolutionSteps: ''
    });
    removeDraftData();
  };

  return (
    <div className="issue-form-page">
      <div className="form-container">
        <div className="form-header">
          <h1>Submit New Issue</h1>
          <p>
            Please provide detailed information about the issue you're
            experiencing.
          </p>
        </div>

        {submitMessage && (
          <div className="alert alert-success animate-fade-in">{submitMessage}</div>
        )}

        {submitError && <div className="alert alert-error animate-fade-in">{submitError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="issue-form">
          <div className="form-group required">
            <label htmlFor="userName">Your Name</label>
            <input
              type="text"
              id="userName"
              className="form-input"
              {...register("userName", {
                required: "Name is required",
                maxLength: {
                  value: 100,
                  message: "Name must be less than 100 characters",
                },
              })}
              placeholder="Enter your full name"
            />
            {errors.userName && (
              <div className="error-message">{errors.userName.message}</div>
            )}
          </div>

          <div className="form-group required">
            <label htmlFor="issueDate">Date of Issue</label>
            <input
              type="date"
              id="issueDate"
              className="form-input"
              {...register("issueDate", {
                required: "Issue date is required",
              })}
            />
            {errors.issueDate && (
              <div className="error-message">{errors.issueDate.message}</div>
            )}
          </div>

          <div className="form-group required">
            <label htmlFor="issueDescription">Issue Description</label>
            <textarea
              id="issueDescription"
              rows="6"
              className="form-textarea"
              {...register("issueDescription", {
                required: "Issue description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters",
                },
                maxLength: {
                  value: 5000,
                  message: "Description must be less than 5000 characters",
                },
              })}
              placeholder="Describe the issue in detail. What happened? What were you trying to do?"
            />
            {errors.issueDescription && (
              <div className="error-message">
                {errors.issueDescription.message}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="precedingEvents">
              Events Leading Up to the Issue
            </label>
            <textarea
              id="precedingEvents"
              rows="4"
              className="form-textarea"
              {...register("precedingEvents", {
                maxLength: {
                  value: 5000,
                  message: "Preceding events must be less than 5000 characters",
                },
              })}
              placeholder="What were you doing before the issue occurred? Any recent changes or updates?"
            />
            {errors.precedingEvents && (
              <div className="error-message">
                {errors.precedingEvents.message}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="resolutionSteps">Steps You've Already Tried</label>
            <textarea
              id="resolutionSteps"
              rows="4"
              className="form-textarea"
              {...register("resolutionSteps", {
                maxLength: {
                  value: 5000,
                  message: "Resolution steps must be less than 5000 characters",
                },
              })}
              placeholder="What have you already tried to fix this issue? Include any troubleshooting steps."
            />
            {errors.resolutionSteps && (
              <div className="error-message">
                {errors.resolutionSteps.message}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Submitting...
                </>
              ) : (
                "Submit Issue"
              )}
            </button>

            <button
              type="button"
              onClick={clearDraft}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Clear Form
            </button>
          </div>
        </form>

        <div className="form-help">
          <h3>Tips for Better Issue Reports</h3>
          <ul>
            <li>Be specific about what you were trying to accomplish</li>
            <li>Include exact error messages if any appeared</li>
            <li>Describe the steps to reproduce the issue</li>
            <li>Note if this worked before or is a new problem</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IssueForm;