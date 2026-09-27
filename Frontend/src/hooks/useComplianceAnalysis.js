import { useState, useEffect, useCallback } from 'react';
import analysisService from '../services/analysisService';

/**
 * Custom hook to manage Compliance Analysis state and data fetching.
 *
 * @param {string} initialScanId - The scan ID passed from routing state
 */
export const useComplianceAnalysis = (initialScanId) => {
  const resolvedScanId = initialScanId || localStorage.getItem('legalmetrix_active_scan_id') || 'latest';
  const [scanId, setScanId] = useState(resolvedScanId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchAnalysis = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await analysisService.getFullAnalysis(id);
      setData(result);
      if (result && result.scanId) {
        setScanId(result.scanId);
        localStorage.setItem('legalmetrix_active_scan_id', result.scanId);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analysis data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const targetId = scanId || initialScanId || localStorage.getItem('legalmetrix_active_scan_id') || 'latest';
    fetchAnalysis(targetId);
  }, [scanId, initialScanId, fetchAnalysis]);

  const retry = () => {
    if (scanId) fetchAnalysis(scanId);
  };

  return {
    scanId,
    loading,
    error,
    data,
    retry
  };
};

export default useComplianceAnalysis;
