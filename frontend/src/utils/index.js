import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export const formatDate = (date) => dayjs(date).format('MMM D, YYYY');
export const formatDateShort = (date) => dayjs(date).format('MMM D');
export const timeAgo = (date) => dayjs(date).fromNow();

export const formatSalary = (min, max, disclosed = true) => {
  if (!disclosed) return 'Not Disclosed';
  if (!min && !max) return 'Not Disclosed';
  if (min && max) return `₹${min} – ₹${max} LPA`;
  if (min) return `₹${min}+ LPA`;
  if (max) return `Up to ₹${max} LPA`;
  return 'Not Disclosed';
};

export const calculateSkillMatch = (jobSkills = [], userSkills = []) => {
  if (!jobSkills.length) return 0;
  const jobSet = jobSkills.map((s) => s.toLowerCase());
  const userSet = userSkills.map((s) => s.toLowerCase());
  const matched = userSet.filter((s) => jobSet.includes(s)).length;
  return Math.round((matched / jobSet.length) * 100);
};

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncate = (str, length = 100) => {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
};

export const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  const diff = dayjs(deadline).diff(dayjs(), 'day');
  return Math.max(0, diff);
};

export const buildQueryString = (params) => {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return new URLSearchParams(filtered).toString();
};

export const avatarColor = (name = '') => {
  const colors = [
    '#1558D6', '#7C3AED', '#059669', '#DC2626',
    '#D97706', '#0891B2', '#9333EA', '#16A34A',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
