import { useState, useEffect, useCallback } from 'react';
import verificationService from '../services/verificationService';
import { REVIEW_STATUS } from '../utils/constants';

export const useVerification = (scanId, findingId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Form State
  const [decision, setDecision] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchVerification = useCallback(async (sId, fId) => {
    // The Officer Verification page can open as a central pending queue without
    // a selected finding. In that state there is no workspace request to make.
    if (!sId || !fId) {
      setLoading(false);
      setError(null);
      setData(null);
      return;
    }

    const targetScanId = sId;
    const targetFindingId = fId;

    setLoading(true);
    setError(null);
    try {
      const result = await verificationService.getVerification(targetScanId, targetFindingId);
      setData(result);
      if (result.status === REVIEW_STATUS.COMPLETED) {
        setDecision(result.decision || '');
        setRemarks(result.remarks || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load verification data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerification(scanId, findingId);
  }, [scanId, findingId, fetchVerification]);

  const submitReview = async () => {
    if (!scanId || !findingId || !decision) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const payload = {
        decision,
        remarks: remarks.trim(),
        reviewedAt: new Date().toISOString()
      };
      const result = await verificationService.submitVerification(scanId, findingId, payload);
      setData(result);
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit the review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const retry = () => {
    if (scanId && findingId) fetchVerification(scanId, findingId);
  };

  return {
    loading,
    error,
    data,
    decision,
    setDecision,
    remarks,
    setRemarks,
    isSubmitting,
    submitSuccess,
    submitError,
    submitReview,
    retry
  };
};

export default useVerification;
