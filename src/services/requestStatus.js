export const getManualRequestStatusTone = (status) => {
  if (status === 'completed') return 'positive';
  if (status === 'pending') return 'warning';
  if (status === 'failed') return 'neutral';
  return 'info';
};

export const getManualRequestStatusLabel = (status) => {
  if (status === 'completed') return 'Approved';
  if (status === 'pending') return 'Pending review';
  if (status === 'failed') return 'Rejected';
  return status || 'Unknown';
};