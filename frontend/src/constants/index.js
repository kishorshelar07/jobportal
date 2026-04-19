export const STATUS_CONFIG = {
  applied: {
    label: 'Applied',
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1D4ED8',
  },
  screening: {
    label: 'Screening',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#B45309',
  },
  interview: {
    label: 'Interview',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    text: '#6D28D9',
  },
  offer: {
    label: 'Offer',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
  },
  hired: {
    label: 'Hired',
    color: '#059669',
    bg: '#D1FAE5',
    border: '#6EE7B7',
    text: '#065F46',
  },
  rejected: {
    label: 'Rejected',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
  },
};

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

export const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const NOTICE_PERIODS = [
  'Immediate', '15 days', '1 month', '2 months', '3 months', 'More than 3 months',
];

export const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce',
  'Manufacturing', 'Consulting', 'Media & Entertainment', 'Real Estate',
  'Logistics', 'Automotive', 'Retail', 'Telecommunications', 'Other',
];

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Expert'];

export const DATE_POSTED_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export const WORK_MODE_COLORS = {
  remote: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  onsite: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  hybrid: { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE' },
};

export const JOB_TYPE_COLORS = {
  'full-time': { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  'part-time': { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  'contract': { bg: '#F0F9FF', text: '#0C4A6E', border: '#BAE6FD' },
  'internship': { bg: '#FDF4FF', text: '#6B21A8', border: '#E9D5FF' },
};
