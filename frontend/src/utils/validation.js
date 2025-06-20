export const validateIssueForm = (formData) => {
  const errors = {};

  // Required fields
  if (!formData.userName || formData.userName.trim().length === 0) {
    errors.userName = 'Name is required';
  } else if (formData.userName.trim().length > 100) {
    errors.userName = 'Name must be less than 100 characters';
  }

  if (!formData.issueDate) {
    errors.issueDate = 'Issue date is required';
  }

  if (!formData.issueDescription || formData.issueDescription.trim().length === 0) {
    errors.issueDescription = 'Issue description is required';
  } else if (formData.issueDescription.trim().length < 10) {
    errors.issueDescription = 'Issue description must be at least 10 characters';
  } else if (formData.issueDescription.trim().length > 5000) {
    errors.issueDescription = 'Issue description must be less than 5000 characters';
  }

  // Optional fields with length limits
  if (formData.precedingEvents && formData.precedingEvents.trim().length > 5000) {
    errors.precedingEvents = 'Preceding events must be less than 5000 characters';
  }

  if (formData.resolutionSteps && formData.resolutionSteps.trim().length > 5000) {
    errors.resolutionSteps = 'Resolution steps must be less than 5000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTechnicianForm = (formData) => {
  const errors = {};

  if (!formData.technicianName || formData.technicianName.trim().length === 0) {
    errors.technicianName = 'Technician name is required';
  } else if (formData.technicianName.trim().length > 100) {
    errors.technicianName = 'Technician name must be less than 100 characters';
  }

  if (!formData.technicianNotes || formData.technicianNotes.trim().length === 0) {
    errors.technicianNotes = 'Technician notes are required';
  } else if (formData.technicianNotes.trim().length > 5000) {
    errors.technicianNotes = 'Technician notes must be less than 5000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};