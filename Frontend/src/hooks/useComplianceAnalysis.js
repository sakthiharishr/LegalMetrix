import { useState, useEffect, useCallback } from 'react';
import analysisService from '../services/analysisService';

/**
 * Loads the compliance analysis for exactly the scan it is given.
 * The scan ID is always taken from the caller so switching scans never shows the previous result.
 */
export const useComplianceAnalysis = (scanId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchAnalysis = useCallback(async (id, isActive = () => true) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await analysisService.getFullAnalysis(id);
      if (!isActive()) return;
      setData(result);
      if (result?.scanId) localStorage.setItem('legalmetrix_active_scan_id', result.scanId);
    } catch (err) {
      if (isActive()) setError(err.message || 'Failed to load analysis data.');
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Ignore a slower response for a scan the user has already moved away from.
    let active = true;
    fetchAnalysis(scanId, () => active);
    return () => {
      active = false;
    };
  }, [scanId, fetchAnalysis]);

  const retry = () => fetchAnalysis(scanId);

  return { scanId, loading, error, data, retry };
};

export default useComplianceAnalysis;
