/**
 * Formatting utilities for Legal Metrix
 */

import { STATUS_LABELS, RISK_LABELS } from './constants';

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (val) => {
  if (val === undefined || val === null) return '0%';
  return `${Math.round(val * 100) / 100}%`;
};

export const getStatusLabel = (statusCode) => {
  return STATUS_LABELS[statusCode] || statusCode;
};

export const getRiskLabel = (riskCode) => {
  return RISK_LABELS[riskCode] || riskCode;
};
