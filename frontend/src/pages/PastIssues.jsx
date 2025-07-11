import React, { useState, useEffect } from 'react';
import { issueAPI } from '../services/api';
import IssueCard from '../components/IssueCard';
import TechnicianPanel from '../components/TechnicianPanel';
import './IssueList.css';

const PastIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showTechPanel, setShowTechPanel] = useState(false);
  
  // Filter states - only resolved issues
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    resolved: 'true' // Only show resolved issues
  });

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await issueAPI.getIssues(filters);
      setIssues(response.issues);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching past issues:', err);
      setError('Failed to load past issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchTerm = formData.get('search');
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleTechnicianUpdate = (issue) => {
    setSelectedIssue(issue);
    setShowTechPanel(true);
  };

  const handleTechnicianSubmit = async (techData) => {
    try {
      const updatedIssue = await issueAPI.updateTechnicianFields(selectedIssue.id, techData);
      setShowTechPanel(false);
      setSelectedIssue(null);
      
      // If issue was marked as unresolved, remove it from the past issues list
      if (!updatedIssue.isResolved) {
        setIssues(prevIssues => prevIssues.filter(issue => issue.id !== selectedIssue.id));
        // Update pagination count
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } else {
        // If still resolved, just refresh to show updated notes
        fetchIssues();
      }
    } catch (error) {
      console.error('Error updating technician fields:', error);
      throw error; // Let TechnicianPanel handle the error display
    }
  };

  return (
    <div className="issue-list-page">
      <div className="page-header">
        <h1>Past Issues Documentation</h1>
        <p>Browse resolved issues and technical solutions for future reference</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-group">
            <input
              type="text"
              name="search"
              placeholder="Search past issues, users, technicians, or solutions..."
              defaultValue={filters.search}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="limit-filter">Per Page:</label>
            <select
              id="limit-filter"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="filter-select"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading past issues...</p>
        </div>
      ) : (
        <>
          <div className="issues-container">
            {issues.length === 0 ? (
              <div className="no-issues">
                <h3>No resolved issues found</h3>
                <p>
                  {filters.search ? 
                    'Try adjusting your search criteria.' : 
                    'No issues have been resolved yet.'
                  }
                </p>
              </div>
            ) : (
              issues.map(issue => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onTechnicianUpdate={handleTechnicianUpdate}
                />
              ))
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="btn btn-secondary"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages} 
                ({pagination.total} resolved issues)
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showTechPanel && (
        <TechnicianPanel
          issue={selectedIssue}
          onSubmit={handleTechnicianSubmit}
          onCancel={() => {
            setShowTechPanel(false);
            setSelectedIssue(null);
          }}
        />
      )}
    </div>
  );
};

export default PastIssues;