import { useState, useEffect, useCallback } from 'react';
import historyService from '../services/historyService';

export const useProductHistoryDetail = (productId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [findings, setFindings] = useState([]);
  const [recurringIssues, setRecurringIssues] = useState([]);
  const [evidence, setEvidence] = useState([]);

  const fetchData = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const [detRes, inspRes, fndRes, recRes, evdRes] = await Promise.all([
        historyService.getProductDetail(productId),
        historyService.getInspectionTimeline(productId),
        historyService.getHistoricalFindings(productId),
        historyService.getRecurringIssues(productId),
        historyService.getHistoricalEvidence(productId)
      ]);
      setDetail(detRes);
      setInspections(inspRes);
      setFindings(fndRes);
      setRecurringIssues(recRes);
      setEvidence(evdRes);
    } catch (err) {
      setError(err.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    detail,
    inspections,
    findings,
    recurringIssues,
    evidence,
    retry: fetchData
  };
};

export default useProductHistoryDetail;
