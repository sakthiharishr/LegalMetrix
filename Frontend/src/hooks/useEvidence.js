import { useState, useEffect, useCallback } from 'react';
import evidenceService from '../services/evidenceService';

export const useEvidence = (scanId, findingId) => {
  const resolvedScanId = scanId || localStorage.getItem('legalmetrix_active_scan_id') || 'latest';
  const resolvedFindingId = findingId || 'latest';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchEvidence = useCallback(async (sId, fId) => {
    const targetScanId = sId || localStorage.getItem('legalmetrix_active_scan_id') || 'latest';
    const targetFindingId = fId || 'latest';
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await evidenceService.getEvidence(targetScanId, targetFindingId);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load evidence data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvidence(scanId, findingId);
  }, [scanId, findingId, fetchEvidence]);

  const retry = () => {
    if (scanId && findingId) fetchEvidence(scanId, findingId);
  };

  return {
    loading,
    error,
    data,
    retry
  };
};

export default useEvidence;
