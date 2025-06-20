import { useState, useCallback } from 'react';
import { issueAPI } from '../services/api';

const useIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  // Fetch all issues with pagination and filtering
  const fetchIssues = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await issueAPI.getIssues(params);
      setIssues(response.issues);
      setPagination(response.pagination);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch issues');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single issue
  const fetchIssue = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const issue = await issueAPI.getIssue(id);
      return issue;
    } catch (err) {
      setError(err.message || 'Failed to fetch issue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new issue
  const createIssue = useCallback(async (issueData) => {
    try {
      setLoading(true);
      setError(null);
      const newIssue = await issueAPI.createIssue(issueData);
      return newIssue;
    } catch (err) {
      setError(err.message || 'Failed to create issue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update entire issue
  const updateIssue = useCallback(async (id, issueData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedIssue = await issueAPI.updateIssue(id, issueData);
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === id ? updatedIssue : issue
        )
      );
      
      return updatedIssue;
    } catch (err) {
      setError(err.message || 'Failed to update issue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update technician fields only
  const updateTechnicianFields = useCallback(async (id, techData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedIssue = await issueAPI.updateTechnicianFields(id, techData);
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === id ? updatedIssue : issue
        )
      );
      
      return updatedIssue;
    } catch (err) {
      setError(err.message || 'Failed to update technician fields');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete issue
  const deleteIssue = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await issueAPI.deleteIssue(id);
      
      // Update local state
      setIssues(prevIssues => 
        prevIssues.filter(issue => issue.id !== id)
      );
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete issue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setIssues([]);
    setLoading(false);
    setError(null);
    setPagination({});
  }, []);

  return {
    // State
    issues,
    loading,
    error,
    pagination,
    
    // Actions
    fetchIssues,
    fetchIssue,
    createIssue,
    updateIssue,
    updateTechnicianFields,
    deleteIssue,
    clearError,
    reset
  };
};

export default useIssues;